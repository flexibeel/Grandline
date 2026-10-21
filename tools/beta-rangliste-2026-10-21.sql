-- Grand Line: Rangliste für die Neue Welt (Beta). Einmal im Supabase SQL-Editor ausführen.
-- Neue Tabelle beta_scores, kein Zugriff von außen, nur über zwei Funktionen:
--   beta_submit(name, tier, gold, boss) trägt den eigenen Stand ein (mit Plausi-Grenzen und Ratebremse)
--   beta_top(woche) liefert die besten 20 (gesamt oder nur diese Woche aktive), dazu den eigenen Platz.
-- Punkte = Seekarte·1000 + Bosse·120 + gesichertes Gold/10 (berechnet der Server, nicht das Spiel).

create table if not exists public.beta_scores (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  tier int not null default 0,
  gold int not null default 0,
  boss int not null default 0,
  score int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.beta_scores enable row level security;
revoke all on public.beta_scores from anon, authenticated;
create index if not exists beta_scores_score on public.beta_scores (score desc);

create or replace function public.beta_submit(p_name text, p_tier int, p_gold int, p_boss int)
returns json language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  old public.beta_scores;
  n text := left(regexp_replace(coalesce(p_name, ''), '[^[:alnum:] äöüÄÖÜß._''-]', '', 'g'), 20);
  t int; g int; b int; s int; r int;
begin
  if me is null then return json_build_object('ok', false, 'why', 'login'); end if;
  if length(trim(n)) < 2 then n := 'Pirat'; end if;
  select * into old from public.beta_scores where id = me;
  -- Ratebremse: höchstens alle 20 Sekunden
  if found and old.updated_at > now() - interval '20 seconds' then
    return json_build_object('ok', false, 'why', 'zu schnell');
  end if;
  -- Plausi: Stufe steigt pro Meldung höchstens um 1, Bosse und Gold passend zur Stufe gedeckelt
  t := greatest(0, least(coalesce(p_tier, 0), 50, coalesce(old.tier, 0) + 1));
  b := greatest(0, least(coalesce(p_boss, 0), (t + 1) * 5));
  g := greatest(0, least(coalesce(p_gold, 0), (t + 1) * 10000));
  -- nie schlechter als vorher
  t := greatest(t, coalesce(old.tier, 0)); b := greatest(b, coalesce(old.boss, 0)); g := greatest(g, coalesce(old.gold, 0));
  s := t * 1000 + b * 120 + g / 10;
  insert into public.beta_scores (id, name, tier, gold, boss, score, updated_at)
    values (me, n, t, g, b, s, now())
    on conflict (id) do update set name = excluded.name, tier = excluded.tier, gold = excluded.gold,
      boss = excluded.boss, score = excluded.score, updated_at = now();
  select count(*) + 1 into r from public.beta_scores where score > s;
  return json_build_object('ok', true, 'score', s, 'rank', r, 'tier', t);
end $$;

create or replace function public.beta_top(p_week boolean default false)
returns table (name text, tier int, boss int, gold int, score int, me boolean, rank bigint)
language sql security definer set search_path = public stable as $$
  with l as (
    select x.*, rank() over (order by x.score desc) as rk from public.beta_scores x
    where not p_week or x.updated_at >= date_trunc('week', now())
  )
  select l.name, l.tier, l.boss, l.gold, l.score, l.id = auth.uid(), l.rk from l
  where l.rk <= 20 or l.id = auth.uid()
  order by l.rk limit 21;
$$;

revoke all on function public.beta_submit(text, int, int, int) from public;
revoke all on function public.beta_top(boolean) from public;
grant execute on function public.beta_submit(text, int, int, int) to authenticated;
grant execute on function public.beta_top(boolean) to anon, authenticated;
