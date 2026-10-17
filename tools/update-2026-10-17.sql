-- Grand Line: Update vom 17.10.2026
-- Einmal im Supabase-Dashboard unter "SQL Editor" komplett einfügen und auf "Run" klicken.
-- Kann gefahrlos mehrfach ausgeführt werden.

-- ============================================================
-- 1) Stammcrew-Verteidigung: "X hat deine Stammcrew herausgefordert"
-- ============================================================
create table if not exists public.duel_events (
  id            bigserial primary key,
  defender      uuid        not null,                    -- wessen Stammcrew angegriffen wurde
  attacker      uuid        not null default auth.uid(), -- wer angegriffen hat
  attacker_name text        check (char_length(attacker_name) <= 24),
  attacker_won  boolean     not null,
  delta         int         not null default 0 check (delta between 0 and 64),
  created_at    timestamptz not null default now()
);
create index if not exists duel_events_defender on public.duel_events (defender, created_at desc);

alter table public.duel_events enable row level security;

drop policy if exists duel_events_insert on public.duel_events;
create policy duel_events_insert on public.duel_events for insert to anon, authenticated
  with check (attacker = auth.uid() and defender <> auth.uid());

drop policy if exists duel_events_select on public.duel_events;
create policy duel_events_select on public.duel_events for select to anon, authenticated
  using (defender = auth.uid());

drop policy if exists duel_events_delete on public.duel_events;
create policy duel_events_delete on public.duel_events for delete to anon, authenticated
  using (defender = auth.uid());

grant select, insert, delete on public.duel_events to anon, authenticated;
grant usage, select on sequence public.duel_events_id_seq to anon, authenticated;

-- Alte Meldungen nach 30 Tagen automatisch weg (beim nächsten Eintrag)
create or replace function public.gl_duel_events_cleanup() returns trigger language plpgsql security definer as $$
begin
  delete from public.duel_events where created_at < now() - interval '30 days';
  return new;
end $$;
drop trigger if exists gl_duel_events_cleanup on public.duel_events;
create trigger gl_duel_events_cleanup after insert on public.duel_events
  for each statement execute function public.gl_duel_events_cleanup();

-- ============================================================
-- 2) Namensfilter auch auf dem Server (falls jemand am Spiel vorbei schreibt)
--    Verbotene Namen werden zu "Pirat".
-- ============================================================
create or replace function public.gl_clean_name(n text) returns text language plpgsql immutable as $$
declare
  raw text := lower(coalesce(n, ''));
  c   text;
begin
  -- Zahlencodes (88, 1488, 18, 28 …) als eigene Zahl
  if raw ~ '(^|[^0-9])(14|18|28|88|1488|8814|168|311)([^0-9]|$)' or raw ~ '1488' then return 'Pirat'; end if;
  -- Zahlen/Zeichen statt Buchstaben, dann alles außer Buchstaben weg
  c := translate(raw, '013457@$!|', 'oieastasii');
  c := replace(replace(replace(replace(c, 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss');
  c := regexp_replace(c, '[^a-z]', '', 'g');
  if c ~ '(nigg|neger|negro|kanake|kanacke|zigeun|untermensch|judensau|auslaenderraus|whitepower|hitler|nazi|siegheil|heilhitler|nsdap|holocaust|auschwitz|gaskammer|hakenkreuz|kukluxklan|hure|hurensohn|schlampe|fotze|nutte|whore|slut|cunt|bitch|vergewalt|paedo|pedophil|kinderf|wichser|fick|fuck|faggot|schwuchtel|tranny|spast|behindert|retard|mongoloid|krueppel|missgeburt|arschloch)' then
    return 'Pirat';
  end if;
  return n;
end $$;

create or replace function public.gl_scores_name() returns trigger language plpgsql as $$
begin
  new.name := public.gl_clean_name(new.name);
  return new;
end $$;
drop trigger if exists gl_scores_name on public.scores;
create trigger gl_scores_name before insert or update on public.scores
  for each row execute function public.gl_scores_name();

-- Bestehende Einträge einmal bereinigen
update public.scores set name = public.gl_clean_name(name) where name is distinct from public.gl_clean_name(name);
