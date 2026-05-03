-- Booking emails need recipient addresses from public.users for both parties.
-- Default RLS only allows users to read their own row, so counselor email was invisible to students.

-- Student can read counselor user rows for counselors they have any appointment with.
drop policy if exists "users_select_peer_via_appointment_student" on public.users;
create policy "users_select_peer_via_appointment_student"
  on public.users for select
  using (
    exists (
      select 1
      from public.appointments a
      inner join public.counselors c on c.id = a.counselor_id and c.user_id = users.id
      where a.student_id = auth.uid()
    )
  );

-- Counselor can read student user rows for their appointments (dashboard + emails).
drop policy if exists "users_select_peer_via_appointment_counselor" on public.users;
create policy "users_select_peer_via_appointment_counselor"
  on public.users for select
  using (
    exists (
      select 1
      from public.appointments a
      inner join public.counselors c on c.id = a.counselor_id and c.user_id = auth.uid()
      where a.student_id = users.id
    )
  );
