-- Students must read time_slots rows tied to their appointments (booked slots).
-- Without this, embedded `time_slots(...)` on appointments returns empty → no date/time on dashboard.
-- Run after 007.

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
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'::public.user_role
    )
  );
