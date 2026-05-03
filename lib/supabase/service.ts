import { createClient } from "@supabase/supabase-js";

/** Server-only client with elevated access (cron jobs). Never import in Client Components. */
export function createServiceRoleSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for service operations.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
