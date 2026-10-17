-- Grand Line: inaktive Gäste aufräumen (im Supabase SQL-Editor einmal ausführen)
-- Gast = anonym angemeldet, ohne E-Mail. Nach 60 Tagen ohne Anmeldung werden
-- Ranglisten-Eintrag und Gast-Anmeldung gelöscht. Der Spielstand hinter dem
-- Spielercode (Tabelle accounts) bleibt noch 180 Tage, damit man ihn per Code zurückholen kann.

create or replace function public.gl_cleanup_guests() returns integer
language plpgsql security definer set search_path = public, auth as $$
declare n integer;
begin
  with old as (
    select id from auth.users
    where is_anonymous = true
      and coalesce(last_sign_in_at, created_at) < now() - interval '60 days'
  ), del as (
    delete from public.scores s using old where s.id = old.id::text returning 1
  )
  select count(*) into n from del;
  delete from auth.users where is_anonymous = true and coalesce(last_sign_in_at, created_at) < now() - interval '60 days';
  delete from public.accounts where updated_at < now() - interval '180 days';
  return n;
end $$;

-- Einmal sofort laufen lassen:
select public.gl_cleanup_guests() as geloeschte_gaeste;

-- Automatisch jede Nacht um 4 Uhr (nur wenn die Erweiterung pg_cron aktiv ist:
-- Supabase > Database > Extensions > pg_cron einschalten, dann diese Zeile ausführen):
-- select cron.schedule('gl-gaeste', '0 4 * * *', 'select public.gl_cleanup_guests()');
