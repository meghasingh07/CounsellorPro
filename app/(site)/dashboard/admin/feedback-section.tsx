import { cardSection, innerCard } from "@/lib/ui/style";

export type AdminFeedbackRow = {
  id: string;
  rating: number;
  comment: string | null;
  student: { name: string; email: string } | null;
  counselor: { name: string; email: string } | null;
  slot: { date: string; start_time: string; end_time: string } | null;
};

function formatTime(t: string) {
  return t.slice(0, 5);
}

export function FeedbackSection({ rows }: { rows: AdminFeedbackRow[] }) {
  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-foreground">Student feedback</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ratings and comments students submit after completed sessions.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No feedback submitted yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {rows.map((f) => {
            const studentLabel =
              f.student?.name?.trim() || f.student?.email?.trim() || "Student";
            const counselorLabel =
              f.counselor?.name?.trim() || f.counselor?.email?.trim() || "Counselor";
            const when =
              f.slot?.date != null
                ? `${new Date(f.slot.date + "T12:00:00").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} · ${formatTime(f.slot.start_time)}–${formatTime(f.slot.end_time)}`
                : "—";

            return (
              <li key={f.id} className={`${innerCard} py-3`}>
                <p className="text-sm font-medium text-foreground">
                  {f.rating}/5 · {studentLabel} → {counselorLabel}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{when}</p>
                {f.student?.email ? (
                  <p className="mt-1 text-xs text-muted-foreground">{f.student.email}</p>
                ) : null}
                {f.comment ? <p className="mt-2 text-sm text-muted-foreground">{f.comment}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
