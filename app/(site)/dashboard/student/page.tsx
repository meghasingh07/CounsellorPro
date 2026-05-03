import { AppointmentsSection, type StudentAppointmentRow } from "@/app/(site)/dashboard/student/appointments-section";
import {
  FeedbackSection,
  type StudentSubmittedFeedbackRow,
} from "@/app/(site)/dashboard/student/feedback-section";
import { OpenSlotsSection, type OpenSlotRow } from "@/app/(site)/dashboard/student/open-slots-section";
import { SignOutForm } from "@/app/(site)/dashboard/sign-out-form";
import { DashboardHeroAside } from "@/components/dashboard/dashboard-hero-aside";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireDashboardRole } from "@/lib/auth/require-dashboard-role";
import { PUBLIC_IMAGES } from "@/lib/constants/public-images";
import { slotEndDateTime } from "@/lib/booking/slot-datetime";
import type { AppointmentStatus } from "@/lib/types/appointment-status";
import Link from "next/link";

const BOOK_HINTS: Record<string, string> = {
  ok: "Your appointment is booked. Join link is below under Upcoming.",
  taken: "Someone else just booked that time. Refresh the list and pick another slot.",
  unavailable: "That slot is no longer available. Refresh the page for the latest open times.",
  error: "Could not complete booking. Try again.",
  invalid: "Invalid slot.",
};

const FB_HINTS: Record<string, string> = {
  ok: "Thanks - your feedback was submitted.",
  invalid: "Choose a rating from 1 to 5.",
  notready: "This session isn't ready for feedback yet.",
  duplicate: "Feedback was already submitted for that session.",
  error: "Could not save feedback. Try again.",
};

type SearchProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value != null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export default async function StudentDashboardPage({ searchParams }: SearchProps) {
  const sp = (await searchParams) ?? {};
  const bookCode = typeof sp.book === "string" ? sp.book : undefined;
  const fbCode = typeof sp.fb === "string" ? sp.fb : undefined;
  const bookHint = bookCode ? BOOK_HINTS[bookCode] ?? null : null;
  const fbHint = fbCode ? FB_HINTS[fbCode] ?? null : null;

  const { supabase, user } = await requireDashboardRole("student");

  const { data: rawSlots } = await supabase
    .from("time_slots")
    .select(
      `
      id,
      date,
      start_time,
      end_time,
      counselor:counselors (
        id,
        meeting_link,
        profile:users!counselors_user_id_fkey ( name )
      )
    `,
    )
    .eq("is_booked", false)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(200);

  const openSlots: OpenSlotRow[] = (rawSlots ?? []).map((row: Record<string, unknown>) => {
    const counselorObj = asRecord(unwrapOne(row.counselor));
    const profileObj = asRecord(unwrapOne(counselorObj?.profile));
    return {
      id: row.id as string,
      date: row.date as string,
      start_time: row.start_time as string,
      end_time: row.end_time as string,
      counselor: counselorObj
        ? {
            id: String(counselorObj.id),
            meeting_link: String(counselorObj.meeting_link ?? ""),
            profile: profileObj?.name != null ? { name: String(profileObj.name) } : null,
          }
        : null,
    };
  });

  const { data: rawAppointments } = await supabase
    .from("appointments")
    .select(
      `
      id,
      status,
      created_at,
      time_slots ( date, start_time, end_time ),
      counselor:counselors (
        meeting_link,
        profile:users!counselors_user_id_fkey ( name )
      )
    `,
    )
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  const appointments: StudentAppointmentRow[] = (rawAppointments ?? []).map(
    (row: Record<string, unknown>) => {
      const slotObj = asRecord(unwrapOne(row.time_slots));
      const counselorObj = asRecord(unwrapOne(row.counselor));
      const profileObj = asRecord(unwrapOne(counselorObj?.profile));
      return {
        id: row.id as string,
        status: row.status as AppointmentStatus,
        created_at: row.created_at as string,
        slot: slotObj
          ? {
              date: String(slotObj.date),
              start_time: String(slotObj.start_time),
              end_time: String(slotObj.end_time),
            }
          : null,
        counselor: counselorObj
          ? {
              meeting_link: String(counselorObj.meeting_link ?? ""),
              profile:
                profileObj?.name != null ? { name: String(profileObj.name) } : null,
            }
          : null,
      };
    },
  );

  const now = new Date();
  const upcoming: StudentAppointmentRow[] = [];
  const past: StudentAppointmentRow[] = [];

  for (const a of appointments) {
    let bucket: "upcoming" | "past" = "past";
    if (a.status === "completed" || a.status === "cancelled") {
      bucket = "past";
    } else if (a.status === "booked" && a.slot) {
      const end = slotEndDateTime(a.slot.date, a.slot.end_time);
      bucket = end >= now ? "upcoming" : "past";
    } else {
      bucket = "past";
    }
    if (bucket === "upcoming") upcoming.push(a);
    else past.push(a);
  }

  const { data: rawFeedbackRows } = await supabase
    .from("feedback")
    .select(
      `
      id,
      rating,
      comment,
      appointment_id,
      appointment:appointments!feedback_appointment_id_fkey (
        time_slots ( date, start_time, end_time ),
        counselor:counselors (
          profile:users!counselors_user_id_fkey ( name )
        )
      )
    `,
    )
    .eq("student_id", user.id);

  const fedIds = new Set(
    (rawFeedbackRows ?? []).map((r) => r.appointment_id as string),
  );

  const submitted: StudentSubmittedFeedbackRow[] = (rawFeedbackRows ?? [])
    .map((row: Record<string, unknown>) => {
      const appt = asRecord(unwrapOne(row.appointment));
      const slot = appt ? asRecord(unwrapOne(appt.time_slots)) : null;
      const counselorObj = appt ? asRecord(unwrapOne(appt.counselor)) : null;
      const profileObj = counselorObj ? asRecord(unwrapOne(counselorObj.profile)) : null;
      return {
        id: row.id as string,
        rating: row.rating as number,
        comment: (row.comment as string | null) ?? null,
        counselorName:
          profileObj?.name != null
            ? String(profileObj.name).trim() || "Counselor"
            : "Counselor",
        slot: slot
          ? {
              date: String(slot.date),
              start_time: String(slot.start_time),
              end_time: String(slot.end_time),
            }
          : null,
      };
    })
    .sort((a, b) => {
      const da = a.slot?.date ?? "";
      const db = b.slot?.date ?? "";
      if (da !== db) return db.localeCompare(da);
      return (b.slot?.start_time ?? "").localeCompare(a.slot?.start_time ?? "");
    });

  const pendingFeedback = appointments.filter(
    (a) => a.status === "completed" && !fedIds.has(a.id),
  );

  return (
    <main className="min-h-full bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Student</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            Home
          </Link>
          <SignOutForm />
        </div>
      </header>

      {(bookHint || fbHint) && (
        <div className="mb-6 space-y-2">
          {bookHint ? (
            <p
              className={`rounded-xl border px-4 py-3 text-sm ${
                bookCode === "ok"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200"
              }`}
            >
              {bookHint}
            </p>
          ) : null}
          {fbHint ? (
            <p
              className={`rounded-xl border px-4 py-3 text-sm ${
                fbCode === "ok"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200"
              }`}
            >
              {fbHint}
            </p>
          ) : null}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(280px,32%)] lg:items-start">
        <div className="flex flex-col gap-8">
          <OpenSlotsSection slots={openSlots} />
          <AppointmentsSection upcoming={upcoming} past={past} />
          <FeedbackSection pendingAppointments={pendingFeedback} submitted={submitted} />
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24">
          <DashboardHeroAside
            label="Your journey"
            imageSrc={PUBLIC_IMAGES.dashStudent}
            imageAlt="Students collaborating on campus"
          />
          <p className="rounded-2xl border border-border bg-card/60 p-4 text-sm leading-relaxed text-muted-foreground transition hover:border-primary/25">
            Book open times, join sessions from <strong className="text-foreground">Upcoming</strong>, and
            share feedback when it feels right.
          </p>
        </aside>
      </div>
      </div>
    </main>
  );
}