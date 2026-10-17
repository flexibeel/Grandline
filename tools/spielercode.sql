-- Grand Line: Spielercode-Speicher
-- Einmal in Supabase ausführen: Dashboard → SQL Editor → New query → alles einfügen → Run.
-- Speichert pro Spielercode einen Spielstand. Der Code selbst wird nie gespeichert,
-- nur sein SHA-256-Fingerabdruck (p_key). Direkter Tabellenzugriff ist gesperrt,
-- lesen/schreiben geht nur über die zwei Funktionen (wer den Code kennt).

create table if not exists public.player_codes (
  code_key   text primary key check (char_length(code_key) = 64),
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.player_codes enable row level security;
-- absichtlich keine Policies: niemand kann die Tabelle direkt lesen oder auflisten

create or replace function public.code_load(p_key text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select data from public.player_codes where code_key = p_key;
$$;

create or replace function public.code_save(p_key text, p_data jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.player_codes (code_key, data, updated_at)
  values (p_key, p_data, now())
  on conflict (code_key) do update set data = excluded.data, updated_at = now();
$$;

revoke all on function public.code_load(text) from public;
revoke all on function public.code_save(text, jsonb) from public;
grant execute on function public.code_load(text) to anon, authenticated;
grant execute on function public.code_save(text, jsonb) to anon, authenticated;
