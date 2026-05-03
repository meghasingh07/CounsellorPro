import { submitFeedback } from "@/app/(site)/dashboard/student/actions";
import type { StudentAppointmentRow } from "@/app/(site)/dashboard/student/appointments-section";
import {
  btnPrimary,
  cardSection,
  inputClass,
  innerCard,
  labelClass,
} from "@/lib/ui/style";

export type StudentSubmittedFeedbackRow = {
  id: string;
  rating: number;
  comment: string | null;
  counselorName: string;
  slot: { date: string; start_time: string; end_time: string } | null;
};

function formatTime(t: string) {
  return t.slice(0, 5);
}

function sessionLabel(slot: StudentSubmittedFeedbackRow["slot"]) {
  if (!slot?.date) return "Session";
  const dateLabel = new Date(slot.date + "T12:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${dateLabel} · ${formatTime(slot.start_time)}–${formatTime(slot.end_time)}`;
}

export function FeedbackSection({
  pendingAppointments,
  submitted,
}: {
  pendingAppointments: StudentAppointmentRow[];
  submitted: StudentSubmittedFeedbackRow[];
}) {
  const hasAny = pendingAppointments.length > 0 || submitted.length > 0;

  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-foreground">Session feedback</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Rate sessions once each and review what you&apos;ve already shared.
      </p>

      {!hasAny ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Nothing here yet. Completed sessions you can rate will show up in this section.
        </p>
      ) : null}

      {pendingAppointments.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Awaiting your rating
          </h3>
          <ul className="mt-4 space-y-8">
            {pendingAppointments.map((a) => {
              const name = a.counselor?.profile?.name?.trim() || "Counselor";
              const dateLabel = a.slot?.date
                ? new Date(a.slot.date + "T12:00:00").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <li
                  key={a.id}
                  className="border-t border-border pt-6 first:border-t-0 first:pt-0"
                >
                  <p className="text-sm font-medium text-foreground">
                    {name} · {dateLabel}
                  </p>
                  <form action={submitFeedback} className="mt-3 flex flex-col gap-3">
                    <input type="hidden" name="appointment_id" value={a.id} />
                    <div>
                      <label htmlFor={`rating-${a.id}`} className={labelClass}>
                        Rating (1–5)
                      </label>
                      <select
                        id={`rating-${a.id}`}
                        name="rating"
                        required
                        defaultValue="5"
                        className={`mt-1 w-full max-w-xs sm:w-auto ${inputClass}`}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`comment-${a.id}`} className={labelClass}>
                        Comment (optional)
                      </label>
                      <textarea
                        id={`comment-${a.id}`}
                        name="comment"
                        rows={3}
                        className={`mt-1 w-full ${inputClass}`}
                        placeholder="How did it go?"
                      />
                    </div>
                    <button type="submit" className={`w-fit ${btnPrimary}`}>
                      Submit feedback
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {submitted.length > 0 ? (
        <div className={pendingAppointments.length > 0 ? "mt-10" : "mt-8"}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Your submitted feedback
          </h3>
          <ul className="mt-4 space-y-4">
            {submitted.map((f) => (
              <li key={f.id} className={`${innerCard} py-3`}>
                <p className="text-sm font-medium text-foreground">
                  {f.rating}/5 · {f.counselorName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{sessionLabel(f.slot)}</p>
                {f.comment ? <p className="mt-2 text-sm text-muted-foreground">{f.comment}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
