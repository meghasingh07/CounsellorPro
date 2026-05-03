import { slotStartInstant } from "@/lib/booking/slot-start-in-tz";
import { sendTransactionalEmail } from "@/lib/email/resend-send";
import type { SupabaseClient } from "@supabase/supabase-js";

/** PostgREST sometimes returns an object or a single-element array for embedded FK rows. */
function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatSlotLabel(
  dateStr: string,
  startTime: string,
  endTime: string,
  timeZone: string,
): string {
  const start = slotStartInstant(dateStr, startTime, timeZone);
  const end = slotStartInstant(dateStr, endTime, timeZone);
  const df = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  });
  return `${df.format(start)} - ${df.format(end)} (${timeZone})`;
}

/**
 * After a successful booking — emails student + counselor.
 * Uses Auth email as fallback when public.users.email is empty.
 */
export async function sendAppointmentCreatedEmails(
  supabase: SupabaseClient,
  appointmentId: string,
  options?: { authStudentEmail?: string | null },
): Promise<void> {
  const tz = process.env.APP_TIMEZONE?.trim() || "UTC";
  const authStudentEmail = options?.authStudentEmail?.trim() || "";

  const { data: row, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      counselor_id,
      student_id,
      student:users!appointments_student_id_fkey ( name, email ),
      counselor:counselors (
        meeting_link,
        profile:users!counselors_user_id_fkey ( name, email )
      ),
      time_slots ( date, start_time, end_time )
    `,
    )
    .eq("id", appointmentId)
    .maybeSingle();

  if (error || !row) {
    console.error("[email] Could not load appointment:", error?.message);
    return;
  }

  const r = row as Record<string, unknown>;
  const studentRow = unwrapOne(
    r.student as { name?: string; email?: string } | null,
  );
  const counselorRow = unwrapOne(
    r.counselor as {
      meeting_link?: string;
      profile?: { name?: string; email?: string };
    } | null,
  );
  const slot = unwrapOne(
    r.time_slots as {
      date?: string;
      start_time?: string;
      end_time?: string;
    } | null,
  );

  let studentName = studentRow?.name?.trim() || "Student";
  let studentEmail = studentRow?.email?.trim() || authStudentEmail || "";

  const counselorProfile = unwrapOne(
    counselorRow?.profile as { name?: string; email?: string } | null,
  );
  let counselorName = counselorProfile?.name?.trim() || "Counselor";
  let counselorEmail = counselorProfile?.email?.trim() || "";
  let meetingLink = (counselorRow?.meeting_link || "").trim();

  const studentId = r.student_id as string | undefined;
  const counselorId = r.counselor_id as string | undefined;

  if (!studentEmail && studentId) {
    const { data: su } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", studentId)
      .maybeSingle();
    if (su?.email?.trim()) studentEmail = su.email.trim();
    if (su?.name?.trim()) studentName = su.name.trim();
  }

  if ((!counselorEmail || !meetingLink) && counselorId) {
    const { data: cou } = await supabase
      .from("counselors")
      .select("meeting_link, user_id")
      .eq("id", counselorId)
      .maybeSingle();
    if (cou?.meeting_link != null && !meetingLink) {
      meetingLink = String(cou.meeting_link).trim();
    }
    if (!counselorEmail && cou?.user_id) {
      const { data: cu } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", cou.user_id)
        .maybeSingle();
      if (cu?.email?.trim()) counselorEmail = cu.email.trim();
      if (cu?.name?.trim()) counselorName = cu.name.trim();
    }
  }

  if (!studentEmail) {
    studentEmail = authStudentEmail;
  }

  if (
    !studentEmail ||
    !counselorEmail ||
    !slot?.date ||
    !slot.start_time ||
    !slot.end_time
  ) {
    console.warn("[email] Missing addresses or slot fields.", {
      hasStudentEmail: Boolean(studentEmail),
      hasCounselorEmail: Boolean(counselorEmail),
      hasSlot: Boolean(slot),
    });
    return;
  }

  const when = formatSlotLabel(slot.date, slot.start_time, slot.end_time, tz);

  const studentBody = [
    `Hello ${studentName},`,
    ``,
    `Your appointment is confirmed.`,
    ``,
    `Counselor: ${counselorName}`,
    `When: ${when}`,
    ``,
    meetingLink
      ? `Join here:\n${meetingLink}`
      : `Meeting link: your counselor will share or update it in the system.`,
    ``,
    `- CounsellorPro`,
  ].join("\n");

  const counselorBody = [
    `Hello ${counselorName},`,
    ``,
    `A student booked a session with you.`,
    ``,
    `Student: ${studentName} (${studentEmail})`,
    `When: ${when}`,
    ``,
    meetingLink
      ? `Your meeting link on file:\n${meetingLink}`
      : `No meeting link set yet - add one in your counselor dashboard.`,
    ``,
    `- CounsellorPro`,
  ].join("\n");

  const htmlStudent = `<pre style="font-family:sans-serif;font-size:14px;line-height:1.5">${escapeHtml(studentBody)}</pre>`;
  const htmlCounselor = `<pre style="font-family:sans-serif;font-size:14px;line-height:1.5">${escapeHtml(counselorBody)}</pre>`;

  try {
    await Promise.all([
      sendTransactionalEmail({
        to: studentEmail,
        subject: "Appointment confirmed",
        text: studentBody,
        html: htmlStudent,
      }),
      sendTransactionalEmail({
        to: counselorEmail,
        subject: `New booking: ${studentName}`,
        text: counselorBody,
        html: htmlCounselor,
      }),
    ]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[email] send failed:", msg);
  }
}

export async function sendAppointmentReminderEmails(params: {
  studentEmail: string;
  studentName: string;
  counselorEmail: string;
  counselorName: string;
  whenLabel: string;
  meetingLink: string;
}): Promise<void> {
  const linkLine = params.meetingLink
    ? `Join here:\n${params.meetingLink}`
    : "Meeting link not set - check your dashboard.";

  const bodyStudent = [
    `Hello ${params.studentName},`,
    ``,
    `Reminder: your counseling session starts in about 5 minutes.`,
    ``,
    `Counselor: ${params.counselorName}`,
    `When: ${params.whenLabel}`,
    ``,
    linkLine,
    ``,
    `- CounsellorPro`,
  ].join("\n");

  const bodyCounselor = [
    `Hello ${params.counselorName},`,
    ``,
    `Reminder: a session with ${params.studentName} starts in about 5 minutes.`,
    ``,
    `When: ${params.whenLabel}`,
    ``,
    linkLine,
    ``,
    `- CounsellorPro`,
  ].join("\n");

  await Promise.all([
    sendTransactionalEmail({
      to: params.studentEmail,
      subject: "Session starting soon",
      text: bodyStudent,
      html: `<pre style="font-family:sans-serif;font-size:14px;line-height:1.5">${escapeHtml(bodyStudent)}</pre>`,
    }),
    sendTransactionalEmail({
      to: params.counselorEmail,
      subject: "Session starting soon",
      text: bodyCounselor,
      html: `<pre style="font-family:sans-serif;font-size:14px;line-height:1.5">${escapeHtml(bodyCounselor)}</pre>`,
    }),
  ]);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}