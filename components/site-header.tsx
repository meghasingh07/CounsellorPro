import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-4 py-5 sm:px-8">
      <Link
        href="/"
        className="text-sm font-semibold tracking-tight text-foreground transition hover:text-primary"
      >
        Counsellor<span className="text-primary">Pro</span>
      </Link>
      <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <ThemeToggle />
        <Link
          href="/login"
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          Register
        </Link>
      </nav>
    </header>
  );
}
