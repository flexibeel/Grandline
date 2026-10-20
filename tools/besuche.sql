-- Besucher zählen (anonym). Erst nach Felix' Zusage im Supabase-SQL-Editor ausführen.
-- Gespeichert wird nur: Zeitpunkt, was passiert ist, woher jemand kam. Keine Kennung, kein Name.
-- Spieler dürfen nur eintragen, nicht lesen. Auswerten kann nur Felix im Dashboard.

create table if not exists public.besuche (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  ereignis   text not null check (ereignis in ('besuch', 'neuer_pirat')),
  quelle     text not null default 'direkt' check (char_length(quelle) between 1 and 32 and quelle ~ '^[a-z0-9.\-]+$')
);

alter table public.besuche enable row level security;

drop policy if exists "besuche eintragen" on public.besuche;
create policy "besuche eintragen" on public.besuche
  for insert to anon, authenticated
  with check (true);

revoke select, update, delete on public.besuche from anon, authenticated;
grant insert on public.besuche to anon, authenticated;

-- Alte Einträge nach 13 Monaten aufräumen (optional, einfach ab und zu ausführen):
-- delete from public.besuche where created_at < now() - interval '13 months';

-- Auswertung: Besuche und neue Piraten pro Quelle, letzte 7 Tage
-- select quelle,
--        count(*) filter (where ereignis = 'besuch')      as besuche,
--        count(*) filter (where ereignis = 'neuer_pirat') as neue_piraten
-- from public.besuche
-- where created_at > now() - interval '7 days'
-- group by quelle order by besuche desc;
