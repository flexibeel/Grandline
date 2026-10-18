alter table public.feedback add column if not exists pin boolean not null default false;
alter table public.feedback add column if not exists name text check (char_length(name) <= 24);
drop policy if exists feedback_pin_read on public.feedback;
create policy feedback_pin_read on public.feedback for select to anon, authenticated using (pin = true);
grant select on public.feedback to anon, authenticated;
