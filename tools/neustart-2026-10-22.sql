-- Grand Line: Neustart für alle (22.10.2026, Felix' Okay über Jan, Punkt 1c im Fahrplan)
-- Löscht ALLE Konten samt Anmeldung, Spielstand, Rangliste, Spielercode und Ereignissen.
-- Es bleibt genau EIN Konto: das neueste mit dem Namen NoNa.
-- KEINE Sicherung (so entschieden). Was Teil 2 löscht, ist weg.
-- Rückmeldungen (Tabelle feedback, Pinnwand) bleiben stehen: Das sind Hinweise ans Team, keine Spielstände.
--
-- Ablauf (Supabase > SQL Editor, jeden Teil einzeln markieren und mit Run ausführen):
--   Teil 1  Vorschau: findet NoNas neuestes Konto, legt es in gl_neustart_keep ab und zählt, was weg würde. Löscht nichts.
--           -> Die ersten 8 Zeichen von keep_id an Claude geben (kommt ins Spiel: GL.config.neustart.keep).
--   (dann schaltet Claude das Spiel mit keep live: jedes Gerät außer NoNas löscht beim Start seinen Stand)
--   Teil 2  Löschen: direkt nach dem Live-Gang. Gelöscht werden nur Konten, die VOR Teil 1 angelegt wurden,
--           wer nach dem Live-Gang frisch startet, bleibt also heil.
--   Teil 3  Nachlauf am nächsten Tag: räumt Ranglisten-Einträge von Tabs auf, die über den Live-Gang offen waren.

-- ===================== TEIL 1: VORSCHAU (löscht nichts) =====================
create table if not exists public.gl_neustart_keep (id uuid primary key, at timestamptz not null default now());
alter table public.gl_neustart_keep enable row level security;   -- keine Policies: nur hier im Dashboard sichtbar

-- Alle Konten, die irgendwo „NoNa“ heißen (Rangliste, Online-Spielstand oder Spielercode), neueste zuerst
with nona as (
  select s.id::text as id from public.scores s where s.name ilike 'nona'
  union select v.id::text from public.saves v where v.data->>'nickname' ilike 'nona'
  union select a.owner::text from public.accounts a where a.name ilike 'nona' and a.owner is not null
)
select u.id as konto_id, left(u.id::text, 8) as keep_id, u.created_at as angelegt, u.last_sign_in_at as zuletzt_da,
       u.is_anonymous as gast, (u.email is not null) as mit_email,
       (select code from public.accounts a where a.owner = u.id order by a.updated_at desc limit 1) as spielercode
from auth.users u join nona on nona.id = u.id::text
order by u.created_at desc;

-- Das neueste davon merken (oberste Zeile oben). Stimmt es nicht, die Zeile von Hand ändern:
--   delete from public.gl_neustart_keep; insert into public.gl_neustart_keep (id) values ('<konto_id>');
insert into public.gl_neustart_keep (id)
select u.id from auth.users u
where u.id::text in (
  select s.id::text as id from public.scores s where s.name ilike 'nona'
  union select v.id::text from public.saves v where v.data->>'nickname' ilike 'nona'
  union select a.owner::text from public.accounts a where a.name ilike 'nona' and a.owner is not null)
order by u.created_at desc limit 1
on conflict do nothing;

-- Genau eine Zeile erwartet
select id as bleibt, left(id::text, 8) as keep_id from public.gl_neustart_keep;

-- Was Teil 2 löschen würde (Stand jetzt)
select
  (select count(*) from auth.users) - 1 as konten,
  (select count(*) from public.saves  where id::text not in (select id::text from public.gl_neustart_keep)) as spielstaende,
  (select count(*) from public.scores where id::text not in (select id::text from public.gl_neustart_keep)) as rangliste,
  (select count(*) from public.accounts where owner is null or owner not in (select id from public.gl_neustart_keep)) as spielercodes;


-- ===================== TEIL 2: LÖSCHEN (nicht rückgängig zu machen) =====================
-- Bricht ab, wenn nicht genau ein Konto zum Behalten feststeht.
begin;
do $$ begin
  if (select count(*) from public.gl_neustart_keep) <> 1 then
    raise exception 'Abbruch: gl_neustart_keep muss genau eine Zeile haben (Teil 1 ausführen)';
  end if;
end $$;

create temp table gl_old on commit drop as
  select id from auth.users
  where created_at < (select at from public.gl_neustart_keep) and id not in (select id from public.gl_neustart_keep);
delete from public.scores   where id::text in (select id::text from gl_old);
delete from public.saves    where id::text in (select id::text from gl_old);
delete from public.accounts where (owner is null and created_at < (select at from public.gl_neustart_keep)) or owner in (select id from gl_old);
delete from public.bottle_post   where to_id    in (select id from gl_old) or from_id  in (select id from gl_old);
delete from public.friend_events where to_id    in (select id from gl_old) or from_id  in (select id from gl_old);
delete from public.duel_events   where defender in (select id from gl_old) or attacker in (select id from gl_old);
delete from public.accounts_takeovers where at < (select at from public.gl_neustart_keep);   -- enthält alte Spielstände
delete from public.code_fails;
-- Reste ohne Konto (z. B. von früher gelöschten Gästen)
delete from public.scores where id::text not in (select id::text from auth.users);
delete from public.saves  where id::text not in (select id::text from auth.users);
-- Anmeldungen zuletzt (beta_scores, Sitzungen und Identitäten hängen per cascade dran)
delete from auth.users where id in (select id from gl_old);
commit;

-- Kontrolle: nur noch NoNa plus wer seit dem Live-Gang frisch gestartet ist
select
  (select count(*) from auth.users where created_at < (select at from public.gl_neustart_keep)) as alte_konten_uebrig_soll_1,
  (select count(*) from auth.users) as konten_uebrig,
  (select count(*) from public.scores) as rangliste_uebrig,
  (select count(*) from public.saves) as spielstaende_uebrig,
  (select count(*) from public.accounts) as spielercodes_uebrig;


-- ===================== TEIL 3: NACHLAUF (am nächsten Tag) =====================
-- Tabs, die über den Live-Gang offen blieben, konnten den alten Stand unter einem neuen Gast-Konto hochladen.
-- Solche Ranglisten-Einträge tragen kein Neustart-Kennzeichen (data->>'ns'). Das Gerät selbst hat sich beim
-- nächsten Laden schon frisch gemacht, übrig ist nur der Eintrag.
delete from public.scores
where id::text not in (select id::text from public.gl_neustart_keep)
  and coalesce(data->>'ns', '') <> 'n1'
  and (select count(*) from public.gl_neustart_keep) = 1;
