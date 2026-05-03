-- Subqueries like `(select id from counselors where user_id = auth.uid())` run WITH RLS on
-- `counselors`. If SELECT on counselors is blocked for the session, inserts/updates on time_slots
-- and related tables fail even when counselor_id is correct.
-- This helper bypasses RLS only to answer: "does this counselor row belong to auth.uid()?"
-- Run after 003 (and 006 is fine to run before or after this).

create or replace function public.counselor_id_is_mine(p_counselor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.counselors c
    where c.id = p_counselor_id
      and c.user_id = auth.uid()
  );
$$;

grant execute on function public.counselor_id_is_mine(uuid) to authenticated;

-- time_slots
drop policy if exists "time_slots_select" on public.time_slots;
create policy "time_slots_select"
  on public.time_slots for select
  using (
    public.counselor_id_is_mine(counselor_id)
    or is_booked = false
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'::public.user_role
    )
  );

drop policy if exists "time_slots_insert_own" on public.time_slots;
create policy "time_slots_insert_own"
  on public.time_slots for insert
  with check (public.counselor_id_is_mine(counselor_id));

drop policy if exists "time_slots_update_own" on public.time_slots;
create policy "time_slots_update_own"
  on public.time_slots for update
  using (public.counselor_id_is_mine(counselor_id));

drop policy if exists "time_slots_delete_own" on public.time_slots;
create policy "time_slots_delete_own"
  on public.time_slots for delete
  using (
    public.counselor_id_is_mine(counselor_id)
    and is_booked = false
  );

-- appointments
drop policy if exists "appointments_select" on public.appointments;
create policy "appointments_select"
  on public.appointments for select
  using (
    student_id = auth.uid()
    or public.counselor_id_is_mine(counselor_id)
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'::public.user_role
    )
  );

drop policy if exists "appointments_update_counselor_status" on public.appointments;
create policy "appointments_update_counselor_status"
  on public.appointments for update
  using (public.counselor_id_is_mine(counselor_id))
  with check (public.counselor_id_is_mine(counselor_id));

-- feedback
drop policy if exists "feedback_select" on public.feedback;
create policy "feedback_select"
  on public.feedback for select
  using (
    public.counselor_id_is_mine(counselor_id)
    or student_id = auth.uid()
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'::public.user_role
    )
  );
