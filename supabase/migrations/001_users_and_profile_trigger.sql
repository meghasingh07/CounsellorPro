-- Role enum + public.users + trigger so each auth user gets a profile row.
-- Run this in Supabase SQL Editor (or supabase db push) before using login/register.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('student', 'counselor', 'admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null,
  role public.user_role not null default 'student'
);

alter table public.users enable row level security;

-- Signed-in users can read their own profile (needed for role-based redirects).
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

-- When a row is created in auth.users, mirror it into public.users.
-- Role/name come from signUp metadata (raw_user_meta_data).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  safe_role public.user_role;
begin
  if r in ('student', 'counselor', 'admin') then
    safe_role := r::public.user_role;
  else
    safe_role := 'student';
  end if;

  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    safe_role
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(nullif(excluded.name, ''), public.users.name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for auth users created before this migration (e.g. manual invites).
insert into public.users (id, name, email, role)
select
  au.id,
  coalesce(au.raw_user_meta_data ->> 'name', split_part(au.email, '@', 1)),
  coalesce(au.email, ''),
  case
    when au.raw_user_meta_data ->> 'role' in ('student', 'counselor', 'admin')
    then (au.raw_user_meta_data ->> 'role')::public.user_role
    else 'student'::public.user_role
  end
from auth.users au
where not exists (select 1 from public.users u where u.id = au.id)
on conflict (id) do nothing;
