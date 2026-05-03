-- Counselors, slots, appointments, feedback + RLS.
-- Run in Supabase SQL Editor after 001 (and 002 if used).

do $$ begin
  create type public.appointment_status as enum ('booked', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

-- One profile per counselor user (meeting link lives here).
create table if not exists public.counselors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  meeting_link text not null default ''
);

create table if not exists public.time_slots (
  id uuid primary key default gen_random_uuid(),
  counselor_id uuid not null references public.counselors (id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  is_booked boolean not null default false,
  constraint time_slots_end_after_start check (end_time > start_time)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users (id) on delete cascade,
  counselor_id uuid not null references public.counselors (id) on delete cascade,
  slot_id uuid not null unique references public.time_slots (id) on delete restrict,
  status public.appointment_status not null default 'booked',
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  counselor_id uuid not null references public.counselors (id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text
);

-- When an appointment is created, mark the slot booked (students never need UPDATE on time_slots).
create or replace function public.after_appointment_insert_mark_slot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.time_slots
  set is_booked = true
  where id = new.slot_id;
  return new;
end;
$$;

drop trigger if exists trg_appointments_mark_slot on public.appointments;
create trigger trg_appointments_mark_slot
  after insert on public.appointments
  for each row execute function public.after_appointment_insert_mark_slot();

alter table public.counselors enable row level security;
alter table public.time_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.feedback enable row level security;

-- Helpers: current role
-- Counselors
drop policy if exists "counselors_select" on public.counselors;
create policy "counselors_select"
  on public.counselors for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'::public.user_role
    )
  );

drop policy if exists "counselors_insert_self" on public.counselors;
create policy "counselors_insert_self"
  on public.counselors for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'counselor'::public.user_role
    )
  );

drop policy if exists "counselors_update_own" on public.counselors;
create policy "counselors_update_own"
  on public.counselors for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "counselors_admin_manage" on public.counselors;
create policy "counselors_admin_manage"
  on public.counselors for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'::public.user_role
    )
  );

-- Time slots: counselors manage own; everyone signed in can see unbooked (for student booking UI).
drop policy if exists "time_slots_select" on public.time_slots;
create policy "time_slots_select"
  on public.time_slots for select
  using (
    counselor_id in (select c.id from public.counselors c where c.user_id = auth.uid())
    or is_booked = false
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'::public.user_role
    )
  );

drop policy if exists "time_slots_insert_own" on public.time_slots;
create policy "time_slots_insert_own"
  on public.time_slots for insert
  with check (
    counselor_id in (select c.id from public.counselors c where c.user_id = auth.uid())
  );

drop policy if exists "time_slots_update_own" on public.time_slots;
create policy "time_slots_update_own"
  on public.time_slots for update
  using (
    counselor_id in (select c.id from public.counselors c where c.user_id = auth.uid())
  );

drop policy if exists "time_slots_delete_own" on public.time_slots;
create policy "time_slots_delete_own"
  on public.time_slots for delete
  using (
    counselor_id in (select c.id from public.counselors c where c.user_id = auth.uid())
    and is_booked = false
  );

-- Appointments
drop policy if exists "appointments_select" on public.appointments;
create policy "appointments_select"
  on public.appointments for select
  using (
    student_id = auth.uid()
    or counselor_id in (select c.id from public.counselors c where c.user_id = auth.uid())
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'::public.user_role
    )
  );

drop policy if exists "appointments_insert_student" on public.appointments;
create policy "appointments_insert_student"
  on public.appointments for insert
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'student'::public.user_role
    )
  );

drop policy if exists "appointments_update_counselor_status" on public.appointments;
create policy "appointments_update_counselor_status"
  on public.appointments for update
  using (
    counselor_id in (select c.id from public.counselors c where c.user_id = auth.uid())
  )
  with check (
    counselor_id in (select c.id from public.counselors c where c.user_id = auth.uid())
  );

-- Feedback: student inserts (later); counselor reads own.
drop policy if exists "feedback_select" on public.feedback;
create policy "feedback_select"
  on public.feedback for select
  using (
    counselor_id in (select c.id from public.counselors c where c.user_id = auth.uid())
    or student_id = auth.uid()
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'::public.user_role
    )
  );

drop policy if exists "feedback_insert_student" on public.feedback;
create policy "feedback_insert_student"
  on public.feedback for insert
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'student'::public.user_role
    )
  );

-- Profiles for counselor accounts that already existed before this migration.
insert into public.counselors (user_id, meeting_link)
select u.id, ''
from public.users u
where u.role = 'counselor'::public.user_role
on conflict (user_id) do nothing;
