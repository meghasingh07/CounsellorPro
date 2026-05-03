import { cardSection, innerCard } from "@/lib/ui/style";

export type FeedbackRow = {
  id: string;
  rating: number;
  comment: string | null;
  student: { name: string } | null;
};

export function FeedbackCard({ items }: { items: FeedbackRow[] }) {
  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-foreground">Feedback</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ratings students submit after completed appointments.
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No feedback yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map((f) => (
            <li key={f.id} className={`${innerCard} py-3`}>
              <p className="text-sm font-medium text-foreground">
                {f.rating}/5 · {f.student?.name?.trim() || "Student"}
              </p>
              {f.comment ? (
                <p className="mt-2 text-sm text-muted-foreground">{f.comment}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
