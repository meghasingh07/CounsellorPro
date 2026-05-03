-- Cancelled appointments kept the same slot_id under a global UNIQUE(slot_id), so new students
-- could not book that slot again (insert → 23505 → "taken" message). Only one *active* booking
-- per slot should be enforced: booked or completed.

alter table public.appointments
  drop constraint if exists appointments_slot_id_key;

create unique index if not exists appointments_slot_id_booked_or_completed_key
  on public.appointments (slot_id)
  where status in ('booked'::public.appointment_status, 'completed'::public.appointment_status);
