import type { AppointmentStatus } from "@/lib/types/appointment-status";
import { cardSection, innerCard } from "@/lib/ui/style";

export type StudentAppointmentRow = {
  id: string;
  status: AppointmentStatus;
  created_at: string;
  slot: { date: string; start_time: string; end_time: string } | null;
  counselor: {
    meeting_link: string;
    profile: { name: string } | null;
  } | null;
};

function formatTime(t: string) {
  return t.slice(0, 5);
}

function MeetingLink({
  href,
}: {
  href: string;
}) {
  if (!href.trim()) {
    return (
      <span className="text-amber-700 dark:text-amber-300">
        Your counselor has not added a meeting link yet.
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-2 hover:opacity-90"
    >
      Join session
    </a>
  );
}

function AppointmentCard({ a }: { a: StudentAppointmentRow }) {
  const name = a.counselor?.profile?.name?.trim() || "Counselor";
  const meeting = a.counselor?.meeting_link ?? "";

  return (
    <li className={`${innerCard} py-4`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">
            {a.slot?.date
              ? new Date(a.slot.date + "T12:00:00").toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—"}{" "}
            ·{" "}
            {a.slot
              ? `${formatTime(a.slot.start_time)}–${formatTime(a.slot.end_time)}`
              : "—"}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
            {a.status}
          </p>
        </div>
        {a.status === "booked" && (
          <div className="text-sm">
            <MeetingLink href={meeting} />
          </div>
        )}
      </div>
    </li>
  );
}

export function AppointmentsSection({
  upcoming,
  past,
}: {
  upcoming: StudentAppointmentRow[];
  past: StudentAppointmentRow[];
}) {
  return (
    <>
      <section className={cardSection}>
        <h2 className="text-lg font-semibold text-foreground">Upcoming</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Active bookings that haven&apos;t ended yet.
        </p>
        {upcoming.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Nothing upcoming.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcoming.map((a) => (
              <AppointmentCard key={a.id} a={a} />
            ))}
          </ul>
        )}
      </section>

      <section className={cardSection}>
        <h2 className="text-lg font-semibold text-foreground">Past</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Completed, cancelled, or sessions that already ended.
        </p>
        {past.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No past appointments.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {past.map((a) => (
              <AppointmentCard key={a.id} a={a} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
