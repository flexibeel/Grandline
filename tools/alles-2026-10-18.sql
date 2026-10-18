-- Grand Line: alles in einem (Flaschenpost + Sicherheit), 18.10.2026

-- Flaschenpost: Ausrüstung der Stammcrew an Freunde verschenken
-- Einmal im Supabase SQL-Editor ausführen. Ohne diese Tabelle bleibt der Knopf einfach wirkungslos (Teil bleibt in deiner Truhe).
create table if not exists public.bottle_post (
  id         bigserial primary key,
  to_id      uuid        not null,                    -- Empfänger
  from_id    uuid        not null default auth.uid(), -- Absender
  from_name  text        check (char_length(from_name) <= 24),
  item       jsonb       not null check (pg_column_size(item) < 2000),
  note       text        check (char_length(note) <= 60),
  created_at timestamptz not null default now()
);
create index if not exists bottle_post_to on public.bottle_post (to_id, created_at);

alter table public.bottle_post enable row level security;

-- Verschicken: nur als man selbst, nicht an sich selbst, höchstens 5 Flaschen pro Tag
drop policy if exists bottle_post_insert on public.bottle_post;
create policy bottle_post_insert on public.bottle_post for insert to anon, authenticated
  with check (
    from_id = auth.uid() and to_id <> auth.uid()
    and (select count(*) from public.bottle_post b where b.from_id = auth.uid() and b.created_at > now() - interval '1 day') < 5
  );

-- Abholen und danach löschen: nur der Empfänger
drop policy if exists bottle_post_select on public.bottle_post;
create policy bottle_post_select on public.bottle_post for select to anon, authenticated using (to_id = auth.uid());
drop policy if exists bottle_post_delete on public.bottle_post;
create policy bottle_post_delete on public.bottle_post for delete to anon, authenticated using (to_id = auth.uid());

grant select, insert, delete on public.bottle_post to anon, authenticated;
grant usage, select on sequence public.bottle_post_id_seq to anon, authenticated;

-- Nicht abgeholte Flaschen verschwinden nach 30 Tagen
create or replace function public.gl_bottle_cleanup() returns trigger language plpgsql security definer as $$
begin
  delete from public.bottle_post where created_at < now() - interval '30 days';
  return new;
end $$;
drop trigger if exists gl_bottle_cleanup on public.bottle_post;
create trigger gl_bottle_cleanup after insert on public.bottle_post for each statement execute function public.gl_bottle_cleanup();

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

-- 5) Entwickler-Stern (★ Entwickler) nur für Felix' Konto, alle anderen verlieren ihn beim Speichern
create or replace function public.gl_scores_star() returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  if new.data ? 'cos' and coalesce((new.data->'cos'->>'star')::text, '') not in ('', 'false', 'null') then
    if coalesce((select email from auth.users where id::text = new.id::text), '') !~* '^westerhol[dt]\.felix@gmail\.com$' then
      new.data := jsonb_set(new.data, '{cos,star}', 'false'::jsonb);
    end if;
  end if;
  return new;
end $$;
drop trigger if exists gl_scores_star on public.scores;
create trigger gl_scores_star before insert or update on public.scores for each row execute function public.gl_scores_star();
-- Bestehende falsche Sterne entfernen
update public.scores s set data = jsonb_set(s.data, '{cos,star}', 'false'::jsonb)
 where s.data ? 'cos' and coalesce(s.data->'cos'->>'star', '') not in ('', 'false', 'null')
   and coalesce((select email from auth.users u where u.id::text = s.id::text), '') !~* '^westerhol[dt]\.felix@gmail\.com$';

-- Kontrolle zum Schluss: alle Regeln auf einen Blick (diese Tabelle bitte an Claude schicken)
select tablename, policyname, cmd, roles, qual, with_check,
       (select string_agg(t.tablename, ', ') from pg_tables t where t.schemaname = 'public' and not t.rowsecurity) as tabellen_ohne_schutz
from pg_policies where schemaname = 'public' order by tablename;
