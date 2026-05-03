import { setAppointmentStatus } from "@/app/(site)/dashboard/counselor/actions";
import type { AppointmentStatus } from "@/lib/types/appointment-status";
import { btnSecondary, cardSection } from "@/lib/ui/style";

export type AppointmentRow = {
  id: string;
  status: AppointmentStatus;
  created_at: string;
  slot_id: string;
  slot: { date: string; start_time: string; end_time: string } | null;
  student: { name: string; email: string } | null;
};

function formatTime(t: string) {
  return t.slice(0, 5);
}

export function AppointmentsCard({
  appointments,
  hint,
}: {
  appointments: AppointmentRow[];
  hint: string | null;
}) {
  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-foreground">Appointments</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Mark sessions completed or cancelled (cancel returns the slot to the pool).
      </p>

      {hint ? (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-200">
          {hint}
        </p>
      ) : null}

      {appointments.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No bookings yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {appointments.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-3 py-4 first:pt-0 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">
                  {a.student?.name?.trim() || a.student?.email || "Student"}
                </p>
                <p className="text-sm text-muted-foreground">{a.student?.email}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {a.slot?.date
                    ? new Date(a.slot.date + "T12:00:00").toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}{" "}
                  · {a.slot ? `${formatTime(a.slot.start_time)}–${formatTime(a.slot.end_time)}` : "—"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {a.status}
                </p>
              </div>

              {a.status === "booked" ? (
                <div className="flex flex-wrap gap-2">
                  <form action={setAppointmentStatus}>
                    <input type="hidden" name="appointment_id" value={a.id} />
                    <input type="hidden" name="status" value="completed" />
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                    >
                      Completed
                    </button>
                  </form>
                  <form action={setAppointmentStatus}>
                    <input type="hidden" name="appointment_id" value={a.id} />
                    <input type="hidden" name="status" value="cancelled" />
                    <button type="submit" className={btnSecondary}>
                      Cancel
                    </button>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
