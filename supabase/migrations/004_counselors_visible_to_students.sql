-- Students need to read counselor rows when booking (open slots) and after booking (meeting link).
-- Runs after 003. Safe to run multiple times.

drop policy if exists "counselors_select_student_booking" on public.counselors;
create policy "counselors_select_student_booking"
  on public.counselors for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'student'::public.user_role
    )
    and (
      exists (
        select 1 from public.time_slots t
        where t.counselor_id = counselors.id and t.is_booked = false
      )
      or exists (
        select 1 from public.appointments a
        where a.counselor_id = counselors.id and a.student_id = auth.uid()
      )
    )
  );
