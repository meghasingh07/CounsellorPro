import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-border bg-gradient-to-b from-card/80 to-background px-4 py-12 backdrop-blur-md sm:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div className="max-w-md">
          <p className="text-base font-semibold tracking-tight text-foreground">
            Counsellor<span className="text-primary">Pro</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Calm scheduling for students, counselors, and admins — built for clarity, not clutter.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:items-end">
          <div className="rounded-2xl border border-border/80 bg-accent/30 px-5 py-3 dark:bg-accent/20">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Made by
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">Megha Singh</p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CounsellorPro · All rights reserved
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <Link href="/" className="text-primary underline-offset-4 hover:underline">
              Home
            </Link>
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
