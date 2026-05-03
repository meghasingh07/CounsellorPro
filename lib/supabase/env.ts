/** True when public Supabase env vars are set (trimmed non-empty). */
export function isSupabasePublicEnvConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

/** Shown in UI when keys are missing — avoids a raw server throw on login/register. */
export function supabasePublicEnvHelpMessage(): string {
  return [
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    "Create .env.local in the project root (copy .env.example), paste your Supabase URL and anon key from Dashboard → Settings → API, then restart the dev server.",
  ].join(" ");
}
