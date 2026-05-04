import { AppointmentsCard, type AppointmentRow } from "@/app/(site)/dashboard/counselor/appointments-card";
import { FeedbackCard, type FeedbackRow } from "@/app/(site)/dashboard/counselor/feedback-card";
import { MeetingLinkCard } from "@/app/(site)/dashboard/counselor/meeting-link-card";
import { SlotFormCard } from "@/app/(site)/dashboard/counselor/slot-form-card";
import { SlotsListCard, type SlotRow } from "@/app/(site)/dashboard/counselor/slots-list-card";
import { SignOutForm } from "@/app/(site)/dashboard/sign-out-form";
import { DashboardHeroAside } from "@/components/dashboard/dashboard-hero-aside";
import { ThemeToggle } from "@/components/theme-toggle";
import { PUBLIC_IMAGES } from "@/lib/constants/public-images";
import { requireDashboardRole } from "@/lib/auth/require-dashboard-role";
import { getOrCreateCounselorProfile } from "@/lib/counselor/get-or-create-profile";
import type { AppointmentStatus } from "@/lib/types/appointment-status";
import Link from "next/link";

const ADD_SLOT_HINTS: Record<string, string> = {
  missing: "Fill in date, start time, and end time.",
  time: "End time must be after start time.",
  db: "Could not save the slot. Please try again.",
};

const EDIT_SLOT_HINTS: Record<string, string> = {
  "edit-missing": "Could not find that slot, or details were incomplete.",
  "edit-time": "Updated end time must be after start time.",
  "edit-booked": "Booked slots cannot be edited.",
  "edit-db": "Could not update slot timing. Please try again.",
};

const APPT_HINTS: Record<string, string> = {
  invalid: "That status update was not valid.",
  missing: "Appointment not found or you do not have access.",
};

type SearchProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CounselorDashboardPage({ searchParams }: SearchProps) {
  const sp = (await searchParams) ?? {};
  const slotCode = typeof sp.slot === "string" ? sp.slot : undefined;
  const apptCode = typeof sp.appt === "string" ? sp.appt : undefined;
  const profileError =
    typeof sp.profileError === "string" ? decodeURIComponent(sp.profileError) : undefined;

  const slotHint = slotCode ? ADD_SLOT_HINTS[slotCode] ?? null : null;
  const editSlotHint = slotCode ? EDIT_SLOT_HINTS[slotCode] ?? null : null;
  const apptHint = apptCode ? APPT_HINTS[apptCode] ?? null : null;

  const { supabase, user } = await requireDashboardRole("counselor");
  const { profile, error: profileLoadError } = await getOrCreateCounselorProfile(
    supabase,
    user.id,
  );

  if (!profile) {
    return (
      <main className="min-h-full bg-background px-4 py-10 text-foreground">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-end">
            <ThemeToggle />
          </div>
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-900 dark:text-red-200">
            <h1 className="text-lg font-semibold">Counselor profile unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {profileLoadError ?? "Could not create your counselor profile."} Please refresh or contact support if this continues.
            </p>
            <Link
              href="/dashboard/counselor"
              className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Retry
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const counselorId = profile.id;

  const { data: slotRows } = await supabase
    .from("time_slots")
    .select("id, date, start_time, end_time, is_booked")
    .eq("counselor_id", counselorId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(200);

  const { data: rawAppointments } = await supabase
    .from("appointments")
    .select(
      `
      id,
      status,
      created_at,
      slot_id,
      time_slots ( date, start_time, end_time ),
      student:users!appointments_student_id_fkey ( name, email )
    `,
    )
    .eq("counselor_id", counselorId)
    .order("created_at", { ascending: false });

  const appointments: AppointmentRow[] = (rawAppointments ?? []).map((row: Record<string, unknown>) => {
    const slot = row.time_slots as
      | { date: string; start_time: string; end_time: string }
      | { date: string; start_time: string; end_time: string }[]
      | null;
    const slotObj = Array.isArray(slot) ? slot[0] : slot;
    const student = row.student as { name: string; email: string } | { name: string; email: string }[] | null;
    const studentObj = Array.isArray(student) ? student[0] : student;
    return {
      id: row.id as string,
      status: row.status as AppointmentStatus,
      created_at: row.created_at as string,
      slot_id: row.slot_id as string,
      slot: slotObj ?? null,
      student: studentObj ?? null,
    };
  });

  const { data: rawFeedback } = await supabase
    .from("feedback")
    .select(
      `
      id,
      rating,
      comment,
      student:users!feedback_student_id_fkey ( name )
    `,
    )
    .eq("counselor_id", counselorId)
    .order("id", { ascending: false });

  const feedbackItems: FeedbackRow[] = (rawFeedback ?? []).map((row: Record<string, unknown>) => {
    const student = row.student as { name: string } | { name: string }[] | null;
    const studentObj = Array.isArray(student) ? student[0] : student;
    return {
      id: row.id as string,
      rating: row.rating as number,
      comment: (row.comment as string | null) ?? null,
      student: studentObj ?? null,
    };
  });

  return (
    <main className="min-h-full bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Counselor</p>
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

        {profileError ? (
          <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-200">
            Profile setup: {profileError}
          </p>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(280px,32%)] lg:items-start">
          <div className="flex flex-col gap-8">
            <MeetingLinkCard meetingLink={profile.meeting_link} />
            <SlotFormCard slotHint={slotHint} />
            <SlotsListCard slots={(slotRows ?? []) as SlotRow[]} slotHint={editSlotHint} />
            <AppointmentsCard appointments={appointments} hint={apptHint} />
            <FeedbackCard items={feedbackItems} />
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24">
            <DashboardHeroAside
              label="Guide each session"
              imageSrc={PUBLIC_IMAGES.dashCounselor}
              imageAlt="Counselor in a professional setting"
            />
            <p className="rounded-2xl border border-border bg-card/60 p-4 text-sm leading-relaxed text-muted-foreground transition hover:border-primary/25">
              Slot status stays in sync with bookings. After you mark{" "}
              <strong className="text-foreground">Completed</strong>, students can leave feedback.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
