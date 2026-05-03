import type { AppointmentStatus } from "@/lib/types/appointment-status";
import { cardSection } from "@/lib/ui/style";

export type AdminAppointmentRow = {
  id: string;
  status: AppointmentStatus;
  created_at: string;
  slot: { date: string; start_time: string; end_time: string } | null;
  student: { name: string; email: string } | null;
  counselorUser: { name: string; email: string } | null;
};

function formatTime(t: string) {
  return t.slice(0, 5);
}

export function AppointmentsSection({ rows }: { rows: AdminAppointmentRow[] }) {
  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-foreground">All appointments</h2>
      <p className="mt-1 text-sm text-muted-foreground">Latest first (up to 200).</p>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No appointments yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-4 font-medium">When</th>
                <th className="py-2 pr-4 font-medium">Student</th>
                <th className="py-2 pr-4 font-medium">Counselor</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="py-3 pr-4 text-foreground">
                    {r.slot?.date
                      ? new Date(r.slot.date + "T12:00:00").toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                    <br />
                    <span className="text-muted-foreground">
                      {r.slot
                        ? `${formatTime(r.slot.start_time)}–${formatTime(r.slot.end_time)}`
                        : ""}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-foreground">{r.student?.name || "—"}</span>
                    <br />
                    <span className="text-muted-foreground">{r.student?.email}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-foreground">{r.counselorUser?.name || "—"}</span>
                    <br />
                    <span className="text-muted-foreground">{r.counselorUser?.email}</span>
                  </td>
                  <td className="py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    {r.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
