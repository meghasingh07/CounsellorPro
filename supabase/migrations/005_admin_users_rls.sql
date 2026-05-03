-- Admins can list and update users (roles). Uses SECURITY DEFINER helper so policies
-- don't recurse when checking admin role. Run after 001.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'admin'::public.user_role
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "users_select_admin" on public.users;
create policy "users_select_admin"
  on public.users for select
  using (public.is_admin());

drop policy if exists "users_update_admin" on public.users;
create policy "users_update_admin"
  on public.users for update
  using (public.is_admin())
  with check (public.is_admin());
