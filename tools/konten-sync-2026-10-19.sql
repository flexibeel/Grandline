-- Grand Line: Konten-Sync 19.10.2026
-- NICHTS davon ist eingespielt. Das Spiel läuft auch ohne (der Abgleich nutzt savedAt im Spielstand selbst).
-- Teil 1 ist rein additiv und gefahrlos, Teil 2 optional. Im Supabase SQL-Editor ausführen.

-- ---------- Teil 1 (empfohlen): Server-Zeit für saves.updated_at ----------
-- Vorher setzte das Gerät updated_at selbst (falsche Uhr am Handy = falsche Zeit). Jetzt immer die Server-Uhr.
-- Rein additiv: neue Funktion + Trigger, keine Daten, keine Regeln geändert.
create or replace function public.gl_saves_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists gl_saves_touch on public.saves;
create trigger gl_saves_touch before insert or update on public.saves
  for each row execute function public.gl_saves_touch();

-- ---------- Teil 2 (optional, empfohlen): Spielercode-Funktionen nicht ohne Anmeldung aufrufbar ----------
-- Supabase-Hinweis „Public Can Execute SECURITY DEFINER Function“. Die Funktionen tun ohne Anmeldung ohnehin nichts
-- (sie prüfen auth.uid()), das Spiel meldet sich immer erst anonym an (Rolle authenticated). Daher gefahrlos:
-- revoke execute on function public.code_claim(text, text, jsonb) from anon;
-- revoke execute on function public.code_load(text) from anon;
-- revoke execute on function public.code_save(text, text, jsonb) from anon;

-- ---------- Prüfen (nur lesen) ----------
-- select tablename, policyname, cmd, qual, with_check from pg_policies where tablename in ('saves', 'scores');
-- Erwartet für saves: SELECT/INSERT/UPDATE nur mit id = auth.uid(), kein DELETE. Größe: saves_data_check < 500 kB.
