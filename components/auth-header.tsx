import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export function AuthHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
      <Link
        href="/"
        className="text-sm font-semibold tracking-tight text-foreground transition hover:text-primary"
      >
        Counsellor<span className="text-primary">Pro</span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
