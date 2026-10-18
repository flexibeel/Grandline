-- Grand Line: Sicherheits-Update 18.10.2026
-- Einmal im Supabase SQL-Editor ausführen (Dashboard → SQL Editor → New query → einfügen → Run).
-- 1) Spielercode-Konten: Speichern nur noch vom Gerät, das den Code besitzt
--    (vorher konnte theoretisch jeder mit einem erratenen Code einen fremden Spielstand überschreiben).
-- 2) Ratebremse beim Laden zusätzlich global (neue anonyme Konten umgehen sonst die Bremse pro Gerät).
-- 3) Prüfen, dass auf allen Tabellen Row Level Security an ist.

alter table public.accounts add column if not exists owner uuid;

create or replace function public.code_claim(p_code text, p_name text, p_data jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  insert into public.accounts (code, name, data, owner) values (p_code, left(p_name, 24), p_data, auth.uid());
  return true;
exception when unique_violation then
  return false;
end; $$;

create or replace function public.code_load(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare d jsonb;
begin
  if auth.uid() is null then return null; end if;
  if (select count(*) from public.code_fails where uid = auth.uid() and at > now() - interval '1 hour') >= 25
     or (select count(*) from public.code_fails where at > now() - interval '1 hour') >= 3000 then
    raise exception 'Zu viele falsche Versuche. Bitte in einer Stunde nochmal.';
  end if;
  select data into d from public.accounts where code = p_code;
  if d is null then
    insert into public.code_fails (uid) values (auth.uid());
  else
    -- Wer den richtigen Code kennt, übernimmt das Konto auf diesem Gerät
    update public.accounts set owner = auth.uid() where code = p_code;
  end if;
  return d;
end; $$;

create or replace function public.code_save(p_code text, p_name text, p_data jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if pg_column_size(p_data) > 500000 then raise exception 'Spielstand zu groß'; end if;
  insert into public.accounts (code, name, data, owner, updated_at) values (p_code, left(p_name, 24), p_data, auth.uid(), now())
  on conflict (code) do update set name = excluded.name, data = excluded.data, updated_at = now(), owner = auth.uid()
    where public.accounts.owner = auth.uid()
       or (public.accounts.owner is null and public.accounts.name is not distinct from left(p_name, 24));
end; $$;

revoke all on function public.code_claim(text, text, jsonb) from public;
revoke all on function public.code_load(text) from public;
revoke all on function public.code_save(text, text, jsonb) from public;
grant execute on function public.code_claim(text, text, jsonb) to anon, authenticated;
grant execute on function public.code_load(text) to anon, authenticated;
grant execute on function public.code_save(text, text, jsonb) to anon, authenticated;

-- Alte Fehlversuche aufräumen
delete from public.code_fails where at < now() - interval '1 day';


-- 4) Rangliste und Spielstände: jeder darf nur seine eigene Zeile schreiben
alter table public.scores enable row level security;
alter table public.saves  enable row level security;

-- Alte Regeln auf scores/saves entfernen (sonst gelten sie zusätzlich), danach nur noch die sicheren
do $$
declare r record;
begin
  for r in select tablename, policyname from pg_policies where schemaname = 'public' and tablename in ('scores', 'saves') loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

drop policy if exists gl_scores_read  on public.scores;
drop policy if exists gl_scores_write on public.scores;
drop policy if exists gl_scores_edit  on public.scores;
drop policy if exists gl_scores_del   on public.scores;
create policy gl_scores_read  on public.scores for select to anon, authenticated using (true);
create policy gl_scores_write on public.scores for insert to anon, authenticated with check (id::text = auth.uid()::text);
create policy gl_scores_edit  on public.scores for update to anon, authenticated using (id::text = auth.uid()::text) with check (id::text = auth.uid()::text);
create policy gl_scores_del   on public.scores for delete to anon, authenticated using (id::text = auth.uid()::text);

drop policy if exists gl_saves_read  on public.saves;
drop policy if exists gl_saves_write on public.saves;
drop policy if exists gl_saves_edit  on public.saves;
create policy gl_saves_read  on public.saves for select to anon, authenticated using (id::text = auth.uid()::text);
create policy gl_saves_write on public.saves for insert to anon, authenticated with check (id::text = auth.uid()::text);
create policy gl_saves_edit  on public.saves for update to anon, authenticated using (id::text = auth.uid()::text) with check (id::text = auth.uid()::text);

-- Zu große Einträge abweisen (gilt für neue Schreibvorgänge)
alter table public.scores drop constraint if exists gl_scores_size;
alter table public.scores add constraint gl_scores_size check (pg_column_size(data) < 60000 and char_length(name) <= 24) not valid;

-- Kontrolle zum Schluss: alle Regeln auf einen Blick (diese Tabelle bitte an Claude schicken)
select tablename, policyname, cmd, roles, qual, with_check,
       (select string_agg(t.tablename, ', ') from pg_tables t where t.schemaname = 'public' and not t.rowsecurity) as tabellen_ohne_schutz
from pg_policies where schemaname = 'public' order by tablename;
