import { updateTimeSlot } from "@/app/(site)/dashboard/counselor/actions";
import { btnSecondary, cardSection, inputClass, labelClass } from "@/lib/ui/style";

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

export function SlotsListCard({ slots, slotHint }: { slots: SlotRow[]; slotHint: string | null }) {
  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-foreground">Your slots</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Open slots appear to students; booked slots show until the session is completed or cancelled.
      </p>
      {slotHint ? (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-200">
          {slotHint}
        </p>
      ) : null}

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
                <th className="py-2 pl-4 text-right font-medium">Action</th>
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
                  <td className="py-2 pl-4 text-right align-top">
                    {s.is_booked ? (
                      <span className="text-xs text-muted-foreground">Locked</span>
                    ) : (
                      <details className="group inline-block text-left">
                        <summary className={`${btnSecondary} cursor-pointer list-none`}>
                          Edit
                        </summary>
                        <form
                          action={updateTimeSlot}
                          className="mt-2 w-[280px] rounded-lg border border-border bg-card p-3 shadow-lg"
                        >
                          <input type="hidden" name="slot_id" value={s.id} />
                          <div>
                            <label htmlFor={`slot-date-${s.id}`} className={labelClass}>
                              Date
                            </label>
                            <input
                              id={`slot-date-${s.id}`}
                              name="date"
                              type="date"
                              required
                              defaultValue={s.date}
                              className={`mt-1 w-full ${inputClass}`}
                            />
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                              <label htmlFor={`slot-start-${s.id}`} className={labelClass}>
                                Start
                              </label>
                              <input
                                id={`slot-start-${s.id}`}
                                name="start_time"
                                type="time"
                                required
                                defaultValue={formatTime(s.start_time)}
                                className={`mt-1 w-full ${inputClass}`}
                              />
                            </div>
                            <div>
                              <label htmlFor={`slot-end-${s.id}`} className={labelClass}>
                                End
                              </label>
                              <input
                                id={`slot-end-${s.id}`}
                                name="end_time"
                                type="time"
                                required
                                defaultValue={formatTime(s.end_time)}
                                className={`mt-1 w-full ${inputClass}`}
                              />
                            </div>
                          </div>
                          <button type="submit" className={`${btnSecondary} mt-3 w-full`}>
                            Save changes
                          </button>
                        </form>
                      </details>
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
