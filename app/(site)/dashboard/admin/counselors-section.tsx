import { adminUpdateCounselorLink } from "@/app/(site)/dashboard/admin/actions";
import { btnPrimary, cardSection, innerCard, inputClass } from "@/lib/ui/style";

export type CounselorAdminRow = {
  id: string;
  meeting_link: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
};

export function CounselorsSection({ counselors }: { counselors: CounselorAdminRow[] }) {
  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-foreground">Counselors</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Meeting links shown to students after they book. Counselors can also edit their own link from their
        dashboard.
      </p>

      {counselors.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No counselor profiles yet. Promote a user to counselor above.
        </p>
      ) : (
        <ul className="mt-4 space-y-6">
          {counselors.map((c) => (
            <li key={c.id} className={`${innerCard} py-4`}>
              <p className="font-medium text-foreground">
                {c.user?.name?.trim() || "—"}{" "}
                <span className="font-normal text-muted-foreground">({c.user?.email})</span>
              </p>
              <p className="text-xs text-muted-foreground">Role in app: {c.user?.role ?? "—"}</p>
              <form action={adminUpdateCounselorLink} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                <input type="hidden" name="counselor_id" value={c.id} />
                <div className="min-w-0 flex-1">
                  <label className="sr-only" htmlFor={`link-${c.id}`}>
                    Meeting link
                  </label>
                  <input
                    id={`link-${c.id}`}
                    name="meeting_link"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    defaultValue={c.meeting_link}
                    className={`w-full ${inputClass}`}
                  />
                </div>
                <button type="submit" className={btnPrimary}>
                  Update link
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
