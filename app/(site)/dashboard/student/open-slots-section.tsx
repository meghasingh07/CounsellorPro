import { bookSlot } from "@/app/(site)/dashboard/student/actions";
import { btnPrimary, cardSection } from "@/lib/ui/style";

export type OpenSlotRow = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  counselor: {
    id: string;
    meeting_link: string;
    profile: { name: string } | null;
  } | null;
};

function formatTime(t: string) {
  return t.slice(0, 5);
}

export function OpenSlotsSection({ slots }: { slots: OpenSlotRow[] }) {
  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-foreground">Book a session</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose an open slot. Your counselor&apos;s meeting link appears on your appointment after you book.
      </p>

      {slots.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No open slots right now. Check back later.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {slots.map((s) => {
            const name = s.counselor?.profile?.name?.trim() || "Counselor";
            return (
              <li
                key={s.id}
                className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(s.date + "T12:00:00").toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    · {formatTime(s.start_time)}–{formatTime(s.end_time)}
                  </p>
                </div>
                <form action={bookSlot}>
                  <input type="hidden" name="slot_id" value={s.id} />
                  <button type="submit" className={btnPrimary}>
                    Book
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
