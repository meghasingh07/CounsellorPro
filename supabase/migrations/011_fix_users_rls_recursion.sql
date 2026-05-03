-- Fixes "Could not load your profile" on login after migration 010:
-- policies on `users` referenced `appointments`, whose policies subqueried `users` for admin → recursion.
--
-- 1) Use security definer is_admin() instead of EXISTS(...) on users inside other policies.
-- 2) Replace peer-read policies with SECURITY DEFINER helpers so evaluating users rows does not
--    re-enter RLS on appointments/counselors.

-- Must exist (repeat safe if 005 already ran).
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

create or replace function public.peer_counselor_profile_readable(counselor_user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.appointments a
    inner join public.counselors c on c.id = a.counselor_id and c.user_id = counselor_user_uuid
    where a.student_id = auth.uid()
  );
$$;

grant execute on function public.peer_counselor_profile_readable(uuid) to authenticated;

create or replace function public.peer_student_profile_readable(student_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.appointments a
    inner join public.counselors c on c.id = a.counselor_id and c.user_id = auth.uid()
    where a.student_id = student_uuid
  );
$$;

grant execute on function public.peer_student_profile_readable(uuid) to authenticated;

-- Peer profile reads (replaces 010 inline EXISTS policies).
drop policy if exists "users_select_peer_via_appointment_student" on public.users;
create policy "users_select_peer_via_appointment_student"
  on public.users for select
  using (public.peer_counselor_profile_readable(users.id));

drop policy if exists "users_select_peer_via_appointment_counselor" on public.users;
create policy "users_select_peer_via_appointment_counselor"
  on public.users for select
  using (public.peer_student_profile_readable(users.id));

-- counselors
drop policy if exists "counselors_select" on public.counselors;
create policy "counselors_select"
  on public.counselors for select
  using (
    user_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "counselors_admin_manage" on public.counselors;
create policy "counselors_admin_manage"
  on public.counselors for all
  using (public.is_admin());

-- time_slots (same logic as 008, admin branch fixed)
drop policy if exists "time_slots_select" on public.time_slots;
create policy "time_slots_select"
  on public.time_slots for select
  using (
    public.counselor_id_is_mine(counselor_id)
    or is_booked = false
    or exists (
      select 1
      from public.appointments a
      where a.slot_id = time_slots.id
        and a.student_id = auth.uid()
    )
    or public.is_admin()
  );

-- appointments
drop policy if exists "appointments_select" on public.appointments;
create policy "appointments_select"
  on public.appointments for select
  using (
    student_id = auth.uid()
    or public.counselor_id_is_mine(counselor_id)
    or public.is_admin()
  );

-- feedback
drop policy if exists "feedback_select" on public.feedback;
create policy "feedback_select"
  on public.feedback for select
  using (
    public.counselor_id_is_mine(counselor_id)
    or student_id = auth.uid()
    or public.is_admin()
  );
