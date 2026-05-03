-- Tracks whether a ~5-minute reminder email was sent (cron sets this once).
alter table public.appointments
  add column if not exists reminder_sent_at timestamptz;
