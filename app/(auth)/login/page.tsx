"use client";

import { loginAction, type LoginState } from "@/app/(auth)/login/actions";
import { AuthHeader } from "@/components/auth-header";
import { AuthPageShell } from "@/components/auth-page-shell";
import { btnPrimary, cardSection, inputClass, labelClass } from "@/lib/ui/style";
import Link from "next/link";
import { useActionState } from "react";

const initial: LoginState = null;

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <AuthPageShell>
      <AuthHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className={`w-full max-w-sm border-primary/10 shadow-xl shadow-primary/5 ${cardSection}`}>
          <h1 className="text-xl font-semibold text-foreground">Log in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with the email and password.
          </p>

          <form action={formAction} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 w-full ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`mt-1 w-full ${inputClass}`}
              />
            </div>

            {state?.error ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {state.error}
              </p>
            ) : null}

            <button type="submit" disabled={pending} className={`w-full ${btnPrimary}`}>
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Register
            </Link>
          </p>

          <Link
            href="/"
            className="mt-4 inline-block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Home
          </Link>
        </div>
      </main>
    </AuthPageShell>
  );
}
