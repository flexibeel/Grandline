-- Flaschenpost: Ausrüstung der Stammcrew an Freunde verschenken
-- Einmal im Supabase SQL-Editor ausführen. Ohne diese Tabelle bleibt der Knopf einfach wirkungslos (Teil bleibt in deiner Truhe).
create table if not exists public.bottle_post (
  id         bigserial primary key,
  to_id      uuid        not null,                    -- Empfänger
  from_id    uuid        not null default auth.uid(), -- Absender
  from_name  text        check (char_length(from_name) <= 24),
  item       jsonb       not null check (pg_column_size(item) < 2000),
  note       text        check (char_length(note) <= 60),
  created_at timestamptz not null default now()
);
create index if not exists bottle_post_to on public.bottle_post (to_id, created_at);

alter table public.bottle_post enable row level security;

-- Verschicken: nur als man selbst, nicht an sich selbst, höchstens 5 Flaschen pro Tag
drop policy if exists bottle_post_insert on public.bottle_post;
create policy bottle_post_insert on public.bottle_post for insert to anon, authenticated
  with check (
    from_id = auth.uid() and to_id <> auth.uid()
    and (select count(*) from public.bottle_post b where b.from_id = auth.uid() and b.created_at > now() - interval '1 day') < 5
  );

-- Abholen und danach löschen: nur der Empfänger
drop policy if exists bottle_post_select on public.bottle_post;
create policy bottle_post_select on public.bottle_post for select to anon, authenticated using (to_id = auth.uid());
drop policy if exists bottle_post_delete on public.bottle_post;
create policy bottle_post_delete on public.bottle_post for delete to anon, authenticated using (to_id = auth.uid());

grant select, insert, delete on public.bottle_post to anon, authenticated;
grant usage, select on sequence public.bottle_post_id_seq to anon, authenticated;

-- Nicht abgeholte Flaschen verschwinden nach 30 Tagen
create or replace function public.gl_bottle_cleanup() returns trigger language plpgsql security definer as $$
begin
  delete from public.bottle_post where created_at < now() - interval '30 days';
  return new;
end $$;
drop trigger if exists gl_bottle_cleanup on public.bottle_post;
create trigger gl_bottle_cleanup after insert on public.bottle_post for each statement execute function public.gl_bottle_cleanup();
