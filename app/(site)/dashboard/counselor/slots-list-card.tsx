import { cardSection } from "@/lib/ui/style";

export type SlotRow = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

function formatTime(t: string) {
  return t.slice(0, 5);
}

export function SlotsListCard({ slots }: { slots: SlotRow[] }) {
  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-foreground">Your slots</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Open slots appear to students; booked slots show until the session is completed or cancelled.
      </p>

      {slots.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No slots yet — add one above.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Time</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id} className="border-b border-border text-foreground">
                  <td className="py-2 pr-4">
                    {new Date(s.date + "T12:00:00").toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-2 pr-4">
                    {formatTime(s.start_time)}–{formatTime(s.end_time)}
                  </td>
                  <td className="py-2">
                    {s.is_booked ? (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Booked
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                        Open
                      </span>
                    )}
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
