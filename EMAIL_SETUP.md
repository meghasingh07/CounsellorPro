# Email notifications (Gmail SMTP) and 5-minute reminders

This project uses Gmail SMTP for booking and reminder notifications.

## 1) Configure Gmail sender

1. Use a Gmail account for notifications (example: `yourname@gmail.com`).
2. Turn on 2-Step Verification on that Google account.
3. Create an App Password in Google Account security settings.
4. Put these in `.env.local`:

- `GMAIL_USER=yourname@gmail.com`
- `GMAIL_APP_PASSWORD=<your app password>`
- optional: `SMTP_FROM_EMAIL=CounsellorPro <yourname@gmail.com>`

## 2) Supabase service role (for reminder cron)

1. Supabase -> Project Settings -> API.
2. Copy `service_role` key to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`.
3. Keep it server-only and never commit it.

## 3) Database migration for reminder timestamp

Run `supabase/migrations/009_appointment_reminder_sent.sql` so `appointments.reminder_sent_at` exists.

## 4) Required env vars

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `APP_TIMEZONE`

## 5) Booking notifications

After a student books, app sends notifications to student and counselor using Gmail SMTP.
If SMTP is not configured, booking still succeeds and email is skipped silently.

## 6) 5-minute reminders

1. Set a strong `CRON_SECRET`.
2. Deploy to Vercel with existing `vercel.json` cron setup.
3. Add all env vars in Vercel Project Settings.
4. Optional local test:

`curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/reminders`

The route checks appointments ~5 minutes before start and sends one reminder email to both participants.

## 7) Time zone

Set `APP_TIMEZONE` to your local timezone, e.g. `Asia/Kolkata`.