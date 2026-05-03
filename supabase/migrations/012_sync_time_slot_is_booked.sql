-- Keep time_slots.is_booked aligned with appointments so student "open slots" (is_booked = false)
-- and counselor slot status stay correct even if the insert trigger was missed or data drifted.

create or replace function public.sync_slot_booked_for_slot(p_slot_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.time_slots
  set is_booked = exists (
    select 1
    from public.appointments a
    where a.slot_id = p_slot_id
      and a.status in ('booked'::public.appointment_status, 'completed'::public.appointment_status)
  )
  where id = p_slot_id;
end;
$$;

-- Replace one-off update with sync (handles completed/cancelled consistently).
create or replace function public.after_appointment_insert_mark_slot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_slot_booked_for_slot(new.slot_id);
  return new;
end;
$$;

create or replace function public.after_appointment_update_sync_slot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_slot_booked_for_slot(coalesce(new.slot_id, old.slot_id));
  return new;
end;
$$;

drop trigger if exists trg_appointments_sync_slot_update on public.appointments;
create trigger trg_appointments_sync_slot_update
  after update of status on public.appointments
  for each row
  execute function public.after_appointment_update_sync_slot();

-- Backfill from current appointments (fixes existing bad rows).
update public.time_slots ts
set is_booked = exists (
  select 1
  from public.appointments a
  where a.slot_id = ts.id
    and a.status in ('booked'::public.appointment_status, 'completed'::public.appointment_status)
);
