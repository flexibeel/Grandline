-- Grand Line: Sicherheits-Update Spielercode (Entwurf 21.10.2026, NOCH NICHT EINGESPIELT)
-- Erst nach ausdrücklichem Ja von Felix im Supabase SQL-Editor ausführen.
--
-- Problem: Ein erfolgreicher code_load macht den Ladenden zum Besitzer. Wer einen fremden Code errät,
-- kann danach den Spielstand überschreiben. Außerdem sperrt die globale Bremse (3000 Fehlversuche/h)
-- bei einem Angriff ALLE aus, auch Spieler, die nur ihren eigenen Stand synchronisieren.
--
-- Warum nicht einfach "kein Besitzwechsel": Das Spiel ruft code_load bei jedem Start auf, und der
-- Besitzwechsel ist genau das, was das Spielen auf zwei Geräten möglich macht. Ohne ihn würde das
-- zweite Gerät still nicht mehr speichern. Das kommt erst mit Geräte-Koppeln (S2) sauber weg.
--
-- Was dieser Entwurf macht:
-- 1) Eigener Code (Gerät ist schon Besitzer) wird nie gebremst -> kein Aussperren aller bei Angriffen.
-- 2) Ratebremse strenger: 10 Fehlversuche pro Gast und Stunde, 30 pro Tag; global 1500/h.
-- 3) Jeder Besitzwechsel wird mit dem alten Stand protokolliert (accounts_takeovers).
--    Damit lässt sich ein gekapertes Konto zurückholen und man sieht, ob überhaupt geraten wird.
-- Der Code hat 31^6 = ~887 Mio. Möglichkeiten, Raten ist also schon heute sehr unwahrscheinlich.
-- Das hier macht es noch teurer und vor allem rückgängig machbar.

create table if not exists public.accounts_takeovers (
  id bigserial primary key,
  code text not null,
  old_owner uuid,
  new_owner uuid not null,
  old_data jsonb,
  at timestamptz not null default now()
);
alter table public.accounts_takeovers enable row level security;   -- keine Policies: nur per Dashboard lesbar

create or replace function public.code_load(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare d jsonb; o uuid;
begin
  if auth.uid() is null then return null; end if;
  select data, owner into d, o from public.accounts where code = p_code;
  -- 1) Eigener Code: immer erlaubt, keine Bremse
  if d is not null and o = auth.uid() then return d; end if;
  -- 2) Fremder oder unbekannter Code: Bremse
  if (select count(*) from public.code_fails where uid = auth.uid() and at > now() - interval '1 hour') >= 10
     or (select count(*) from public.code_fails where uid = auth.uid() and at > now() - interval '1 day') >= 30
     or (select count(*) from public.code_fails where at > now() - interval '1 hour') >= 1500 then
    raise exception 'Zu viele falsche Versuche. Bitte in einer Stunde nochmal.';
  end if;
  if d is null then
    insert into public.code_fails (uid) values (auth.uid());
    return null;
  end if;
  -- 3) Richtiger Code von einem anderen Gerät: Besitz wechselt (wie bisher), alter Stand wird gesichert
  insert into public.accounts_takeovers (code, old_owner, new_owner, old_data) values (p_code, o, auth.uid(), d);
  update public.accounts set owner = auth.uid() where code = p_code;
  return d;
end; $$;

revoke all on function public.code_load(text) from public;
grant execute on function public.code_load(text) to anon, authenticated;

-- Protokoll nach 30 Tagen aufräumen (läuft bei jedem neuen Eintrag mit, billig dank Index)
create index if not exists accounts_takeovers_at on public.accounts_takeovers (at);
create or replace function public.gl_takeovers_cleanup() returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.accounts_takeovers where at < now() - interval '30 days';
  return null;
end; $$;
drop trigger if exists gl_takeovers_cleanup on public.accounts_takeovers;
create trigger gl_takeovers_cleanup after insert on public.accounts_takeovers
  for each statement execute function public.gl_takeovers_cleanup();
