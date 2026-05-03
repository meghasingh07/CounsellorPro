import { updateMeetingLink } from "@/app/(site)/dashboard/counselor/actions";
import { btnPrimary, cardSection, inputClass } from "@/lib/ui/style";

export function MeetingLinkCard({ meetingLink }: { meetingLink: string }) {
  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-foreground">Meeting link</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        One link reused for every appointment (for example Google Meet).
      </p>
      <form action={updateMeetingLink} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="meeting_link" className="sr-only">
            Meeting URL
          </label>
          <input
            id="meeting_link"
            name="meeting_link"
            type="url"
            placeholder="https://meet.google.com/..."
            defaultValue={meetingLink}
            className={`w-full ${inputClass}`}
          />
        </div>
        <button type="submit" className={btnPrimary}>
          Save
        </button>
      </form>
    </section>
  );
}
