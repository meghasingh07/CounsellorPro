import { createTimeSlot } from "@/app/(site)/dashboard/counselor/actions";
import { btnPrimary, cardSection, inputClass, labelClass } from "@/lib/ui/style";

export function SlotFormCard({ slotHint }: { slotHint: string | null }) {
  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-foreground">Add time slot</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Create an available window students can book (one row per slot).
      </p>

      {slotHint ? (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-200">
          {slotHint}
        </p>
      ) : null}

      <form action={createTimeSlot} className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="slot_date" className={labelClass}>
            Date
          </label>
          <input
            id="slot_date"
            name="date"
            type="date"
            required
            className={`mt-1 w-full ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="start_time" className={labelClass}>
            Start
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            required
            className={`mt-1 w-full ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="end_time" className={labelClass}>
            End
          </label>
          <input
            id="end_time"
            name="end_time"
            type="time"
            required
            className={`mt-1 w-full ${inputClass}`}
          />
        </div>
        <div className="sm:col-span-3">
          <button type="submit" className={btnPrimary}>
            Add slot
          </button>
        </div>
      </form>
    </section>
  );
}
