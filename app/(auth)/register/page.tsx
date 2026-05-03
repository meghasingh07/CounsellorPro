"use client";

import { registerAction, type RegisterState } from "@/app/(auth)/register/actions";
import { AuthHeader } from "@/components/auth-header";
import { AuthPageShell } from "@/components/auth-page-shell";
import { btnPrimary, cardSection, inputClass, labelClass } from "@/lib/ui/style";
import { USER_ROLES } from "@/lib/types/user-role";
import Link from "next/link";
import { useActionState } from "react";

const initial: RegisterState = null;

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <AuthPageShell>
      <AuthHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className={`w-full max-w-sm border-primary/10 shadow-xl shadow-primary/5 ${cardSection}`}>
          <h1 className="text-xl font-semibold text-foreground">Register</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account to start booking and managing counseling sessions.
          </p>

          <form action={formAction} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className={`mt-1 w-full ${inputClass}`}
              />
            </div>
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
                autoComplete="new-password"
                required
                minLength={6}
                className={`mt-1 w-full ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="role" className={labelClass}>
                Role
              </label>
              <select
                id="role"
                name="role"
                defaultValue="student"
                className={`mt-1 w-full ${inputClass}`}
              >
                {USER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {state?.error ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {state.error}
              </p>
            ) : null}
            {state?.message ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">
                {state.message}
              </p>
            ) : null}

            <button type="submit" disabled={pending} className={`w-full ${btnPrimary}`}>
              {pending ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Log in
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
