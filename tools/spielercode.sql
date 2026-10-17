-- Grand Line: Spielercode-Konten (kurzer Code, z. B. K7Q-F9X)
-- Einmal in Supabase ausführen: Dashboard → SQL Editor → New query → alles einfügen → Run.
-- Tabelle "accounts": Code → Spielername → Spielstand. Nur du siehst sie im Dashboard;
-- Spieler kommen nur über die Funktionen dran (und nur mit dem richtigen Code).
-- Rateschutz: max. 25 falsche Codes pro Gerät und Stunde.

create table if not exists public.accounts (
  code       text primary key check (code ~ '^[2-9A-HJ-KM-NP-Z]{6}$'),
  name       text,
  data       jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.accounts enable row level security;

create table if not exists public.code_fails (
  uid uuid,
  at  timestamptz not null default now()
);
alter table public.code_fails enable row level security;
create index if not exists code_fails_uid_at on public.code_fails (uid, at);

-- Neuen Code reservieren: true = gehört jetzt dir, false = schon vergeben (dann neuen würfeln)
create or replace function public.code_claim(p_code text, p_name text, p_data jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  insert into public.accounts (code, name, data) values (p_code, p_name, p_data);
  return true;
exception when unique_violation then
  return false;
end; $$;

-- Spielstand zu einem Code laden (mit Rateschutz)
create or replace function public.code_load(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare d jsonb;
begin
  if (select count(*) from public.code_fails where uid = auth.uid() and at > now() - interval '1 hour') >= 25 then
    raise exception 'Zu viele falsche Versuche. Bitte in einer Stunde nochmal.';
  end if;
  select data into d from public.accounts where code = p_code;
  if d is null then
    insert into public.code_fails (uid) values (auth.uid());
  end if;
  return d;
end; $$;

-- Spielstand unter dem eigenen Code speichern
create or replace function public.code_save(p_code text, p_name text, p_data jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.accounts (code, name, data, updated_at) values (p_code, p_name, p_data, now())
  on conflict (code) do update set name = excluded.name, data = excluded.data, updated_at = now();
$$;

revoke all on function public.code_claim(text, text, jsonb) from public;
revoke all on function public.code_load(text) from public;
revoke all on function public.code_save(text, text, jsonb) from public;
grant execute on function public.code_claim(text, text, jsonb) to anon, authenticated;
grant execute on function public.code_load(text) to anon, authenticated;
grant execute on function public.code_save(text, text, jsonb) to anon, authenticated;

-- Alte Version (lange Codes) aufräumen, falls schon ausgeführt
drop function if exists public.code_load(text, text);
drop table if exists public.player_codes cascade;
