-- Grand Line: Segelkumpane (Freunde anheuern mit Benachrichtigung), 18.10.2026
-- Einmal im Supabase SQL Editor ausführen. Ohne diese Tabelle funktioniert das Anheuern trotzdem,
-- nur bekommt der andere Spieler keine Nachricht.
create table if not exists public.friend_events (
  id         bigserial primary key,
  to_id      uuid        not null,
  from_id    uuid        not null default auth.uid(),
  from_name  text        check (char_length(from_name) <= 24),
  from_code  text        not null check (from_code ~ '^[2-9A-HJKMNP-Z]{6}$'),
  created_at timestamptz not null default now()
);
create index if not exists friend_events_to on public.friend_events (to_id, created_at);
alter table public.friend_events enable row level security;

drop policy if exists friend_events_insert on public.friend_events;
create policy friend_events_insert on public.friend_events for insert to anon, authenticated
  with check (from_id = auth.uid() and to_id <> auth.uid()
    and (select count(*) from public.friend_events f where f.from_id = auth.uid() and f.created_at > now() - interval '1 day') < 30);
drop policy if exists friend_events_select on public.friend_events;
create policy friend_events_select on public.friend_events for select to anon, authenticated using (to_id = auth.uid());
drop policy if exists friend_events_delete on public.friend_events;
create policy friend_events_delete on public.friend_events for delete to anon, authenticated using (to_id = auth.uid());

grant select, insert, delete on public.friend_events to anon, authenticated;
grant usage, select on sequence public.friend_events_id_seq to anon, authenticated;

create or replace function public.gl_friend_events_cleanup() returns trigger language plpgsql security definer as $$
begin delete from public.friend_events where created_at < now() - interval '30 days'; return new; end $$;
drop trigger if exists gl_friend_events_cleanup on public.friend_events;
create trigger gl_friend_events_cleanup after insert on public.friend_events for each statement execute function public.gl_friend_events_cleanup();
