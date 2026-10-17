-- Grand Line: bestimmte Einträge aus der Rangliste entfernen (Supabase > SQL Editor)
-- Schritt 1: erst ansehen, was gefunden wird (nur lesen)
select id, name, score, (data->>'updated') as zuletzt
from public.scores
where name ilike '%newgate%'
   or name ilike '%crazy captain%'
   or name ilike '%chaot%'
   or name ilike 'sk%r%r%'
   or name ilike '%he%g%s gang%' or name ilike '%heges%'
order by score desc;

-- Schritt 2: wenn die Liste oben stimmt, diesen Block ausführen.
-- Löscht Ranglisten-Eintrag und Cloud-Spielstand. Kommt die Person wieder, legt sie einfach einen neuen Piraten an.
with weg as (
  select id from public.scores
  where name ilike '%newgate%'
     or name ilike '%crazy captain%'
     or name ilike '%chaot%'
     or name ilike 'sk%r%r%'
     or name ilike '%he%g%s gang%' or name ilike '%heges%'
)
, s as (delete from public.saves where id in (select id from weg) returning 1)
delete from public.scores where id in (select id from weg);
