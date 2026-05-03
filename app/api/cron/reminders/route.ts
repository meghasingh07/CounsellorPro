import { slotStartInstant } from "@/lib/booking/slot-start-in-tz";
import {
  sendAppointmentReminderEmails,
} from "@/lib/email/appointment-emails";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

/** 4–6 minutes before start → send once (works with a 1-minute cron schedule). */
const WINDOW_MIN_MS = 4 * 60 * 1000;
const WINDOW_MAX_MS = 6 * 60 * 1000;

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return new Response("Missing SUPABASE_SERVICE_ROLE_KEY", { status: 500 });
  }

  const tz = process.env.APP_TIMEZONE?.trim() || "UTC";
  const now = Date.now();
  let sent = 0;
  let errors = 0;

  try {
    const sb = createServiceRoleSupabaseClient();
    const { data: rows, error: qErr } = await sb
      .from("appointments")
      .select(
        `
        id,
        student:users!appointments_student_id_fkey ( name, email ),
        counselor:counselors (
          meeting_link,
          profile:users!counselors_user_id_fkey ( name, email )
        ),
        time_slots ( date, start_time, end_time )
      `,
      )
      .eq("status", "booked")
      .is("reminder_sent_at", null)
      .limit(400);

    if (qErr || !rows?.length) {
      return Response.json({
        ok: true,
        scanned: 0,
        sent: 0,
        error: qErr?.message,
      });
    }

    const df = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: tz,
    });

    for (const raw of rows) {
      const apt = raw as Record<string, unknown>;
      const slot = apt.time_slots as
        | { date: string; start_time: string; end_time: string }
        | null;
      const student = apt.student as { name?: string; email?: string } | null;
      const counselor = apt.counselor as {
        meeting_link?: string;
        profile?: { name?: string; email?: string };
      } | null;

      if (
        !slot?.date ||
        !slot.start_time ||
        !student?.email ||
        !counselor?.profile?.email
      ) {
        continue;
      }

      const start = slotStartInstant(slot.date, slot.start_time, tz);
      const delta = start.getTime() - now;
      if (delta < WINDOW_MIN_MS || delta > WINDOW_MAX_MS) {
        continue;
      }

      const id = String(apt.id);
      const claimIso = new Date().toISOString();

      const { data: claimed, error: claimErr } = await sb
        .from("appointments")
        .update({ reminder_sent_at: claimIso })
        .eq("id", id)
        .is("reminder_sent_at", null)
        .select("id")
        .maybeSingle();

      if (claimErr || !claimed) {
        continue;
      }

      const studentName = student.name?.trim() || "Student";
      const counselorName =
        counselor.profile?.name?.trim() || "Counselor";
      const end =
        slot.end_time != null
          ? slotStartInstant(slot.date, slot.end_time, tz)
          : start;
      const whenLabel = `${df.format(start)} – ${df.format(end)} (${tz})`;

      try {
        await sendAppointmentReminderEmails({
          studentEmail: student.email.trim(),
          studentName,
          counselorEmail: counselor.profile!.email!.trim(),
          counselorName,
          whenLabel,
          meetingLink: (counselor.meeting_link || "").trim(),
        });
        sent += 1;
      } catch {
        errors += 1;
        await sb
          .from("appointments")
          .update({ reminder_sent_at: null })
          .eq("id", id);
      }
    }

    return Response.json({ ok: true, scanned: rows.length, sent, errors });
  } catch (e) {
    console.error("[cron/reminders]", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
