-- Reliable read for the logged-in user's counselor row (bypasses RLS edge cases
-- where INSERT hits duplicate key but SELECT returned no rows).
-- Run in Supabase SQL Editor after 003.

create or replace function public.get_my_counselor_profile()
returns setof public.counselors
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.counselors c
  where c.user_id = auth.uid();
$$;

grant execute on function public.get_my_counselor_profile() to authenticated;
