import { AppointmentsSection, type AdminAppointmentRow } from "@/app/(site)/dashboard/admin/appointments-section";
import { FeedbackSection, type AdminFeedbackRow } from "@/app/(site)/dashboard/admin/feedback-section";
import { CounselorsSection, type CounselorAdminRow } from "@/app/(site)/dashboard/admin/counselors-section";
import { UsersSection, type AdminUserRow } from "@/app/(site)/dashboard/admin/users-section";
import { SignOutForm } from "@/app/(site)/dashboard/sign-out-form";
import { DashboardHeroAside } from "@/components/dashboard/dashboard-hero-aside";
import { ThemeToggle } from "@/components/theme-toggle";
import { PUBLIC_IMAGES } from "@/lib/constants/public-images";
import { requireDashboardRole } from "@/lib/auth/require-dashboard-role";
import type { AppointmentStatus } from "@/lib/types/appointment-status";
import type { UserRole } from "@/lib/types/user-role";
import { isUserRole } from "@/lib/types/user-role";
import Link from "next/link";

const USER_HINTS: Record<string, string> = {
  ok: "User role updated.",
  error: "Could not update role.",
  invalid: "Invalid role or user.",
  self: "You cannot change your own role from this screen.",
};

const COUNSELOR_HINTS: Record<string, string> = {
  ok: "Meeting link saved.",
  error: "Could not update meeting link.",
  invalid: "Invalid counselor.",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value != null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

type SearchProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminDashboardPage({ searchParams }: SearchProps) {
  const sp = (await searchParams) ?? {};
  const usersCode = typeof sp.users === "string" ? sp.users : undefined;
  const counselorsCode = typeof sp.counselors === "string" ? sp.counselors : undefined;
  const userHint = usersCode ? USER_HINTS[usersCode] ?? null : null;
  const counselorHint = counselorsCode ? COUNSELOR_HINTS[counselorsCode] ?? null : null;

  const { supabase, user } = await requireDashboardRole("admin");

  const { data: rawUsers } = await supabase
    .from("users")
    .select("id, name, email, role")
    .order("email", { ascending: true });

  const users: AdminUserRow[] = (rawUsers ?? []).map((row) => ({
    id: row.id as string,
    name: (row.name as string) ?? "",
    email: (row.email as string) ?? "",
    role: isUserRole(row.role as string) ? (row.role as UserRole) : "student",
  }));

  const { data: rawCounselors } = await supabase
    .from("counselors")
    .select(
      `
      id,
      meeting_link,
      user:users!counselors_user_id_fkey ( id, name, email, role )
    `,
    )
    .order("id", { ascending: true });

  const counselors: CounselorAdminRow[] = (rawCounselors ?? []).map(
    (row: Record<string, unknown>) => {
      const u = asRecord(unwrapOne(row.user));
      return {
        id: row.id as string,
        meeting_link: String(row.meeting_link ?? ""),
        user: u
          ? {
              id: String(u.id),
              name: String(u.name ?? ""),
              email: String(u.email ?? ""),
              role: String(u.role ?? ""),
            }
          : null,
      };
    },
  );

  const { data: rawAppts } = await supabase
    .from("appointments")
    .select(
      `
      id,
      status,
      created_at,
      time_slots ( date, start_time, end_time ),
      student:users!appointments_student_id_fkey ( name, email ),
      counselor:counselors (
        profile:users!counselors_user_id_fkey ( name, email )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const appointments: AdminAppointmentRow[] = (rawAppts ?? []).map(
    (row: Record<string, unknown>) => {
      const slot = asRecord(unwrapOne(row.time_slots));
      const student = asRecord(unwrapOne(row.student));
      const counselorObj = asRecord(unwrapOne(row.counselor));
      const counselorUser = asRecord(unwrapOne(counselorObj?.profile));
      return {
        id: row.id as string,
        status: row.status as AppointmentStatus,
        created_at: row.created_at as string,
        slot: slot
          ? {
              date: String(slot.date),
              start_time: String(slot.start_time),
              end_time: String(slot.end_time),
            }
          : null,
        student: student
          ? {
              name: String(student.name ?? ""),
              email: String(student.email ?? ""),
            }
          : null,
        counselorUser: counselorUser
          ? {
              name: String(counselorUser.name ?? ""),
              email: String(counselorUser.email ?? ""),
            }
          : null,
      };
    },
  );

  const { data: rawFeedback } = await supabase
    .from("feedback")
    .select(
      `
      id,
      rating,
      comment,
      appointment:appointments!feedback_appointment_id_fkey (
        time_slots ( date, start_time, end_time ),
        student:users!appointments_student_id_fkey ( name, email ),
        counselor:counselors (
          profile:users!counselors_user_id_fkey ( name, email )
        )
      )
    `,
    )
    .order("id", { ascending: false })
    .limit(200);

  const feedbackRows: AdminFeedbackRow[] = (rawFeedback ?? []).map(
    (row: Record<string, unknown>) => {
      const appt = asRecord(unwrapOne(row.appointment));
      const slot = appt ? asRecord(unwrapOne(appt.time_slots)) : null;
      const student = appt ? asRecord(unwrapOne(appt.student)) : null;
      const counselorObj = appt ? asRecord(unwrapOne(appt.counselor)) : null;
      const counselorUser = counselorObj ? asRecord(unwrapOne(counselorObj.profile)) : null;
      return {
        id: row.id as string,
        rating: row.rating as number,
        comment: (row.comment as string | null) ?? null,
        student: student
          ? {
              name: String(student.name ?? ""),
              email: String(student.email ?? ""),
            }
          : null,
        counselor: counselorUser
          ? {
              name: String(counselorUser.name ?? ""),
              email: String(counselorUser.email ?? ""),
            }
          : null,
        slot: slot
          ? {
              date: String(slot.date),
              start_time: String(slot.start_time),
              end_time: String(slot.end_time),
            }
          : null,
      };
    },
  );

  return (
    <main className="min-h-full bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Admin</p>
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

        {(userHint || counselorHint) && (
          <div className="mb-6 space-y-2">
            {userHint ? (
              <p
                className={`rounded-xl border px-4 py-3 text-sm ${
                  usersCode === "ok"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200"
                }`}
              >
                {userHint}
              </p>
            ) : null}
            {counselorHint ? (
              <p
                className={`rounded-xl border px-4 py-3 text-sm ${
                  counselorsCode === "ok"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200"
                }`}
              >
                {counselorHint}
              </p>
            ) : null}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(280px,32%)] lg:items-start">
          <div className="flex flex-col gap-8">
            <UsersSection users={users} currentAdminId={user.id} />
            <CounselorsSection counselors={counselors} />
            <AppointmentsSection rows={appointments} />
            <FeedbackSection rows={feedbackRows} />
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24">
            <DashboardHeroAside
              label="Overview"
              imageSrc={PUBLIC_IMAGES.dashAdmin}
              imageAlt="Team collaboration"
            />
            <p className="rounded-2xl border border-border bg-card/60 p-4 text-sm leading-relaxed text-muted-foreground transition hover:border-primary/25">
              Monitor users, counselors, appointments, and student feedback from one place.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
