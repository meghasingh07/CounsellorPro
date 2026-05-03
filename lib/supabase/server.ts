import {
  isSupabasePublicEnvConfigured,
  supabasePublicEnvHelpMessage,
} from "@/lib/supabase/env";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client — use in Server Components, Route Handlers, Server Actions.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!isSupabasePublicEnvConfigured() || !url || !anonKey) {
    throw new Error(supabasePublicEnvHelpMessage());
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from Server Component — middleware will refresh session when needed.
        }
      },
    },
  });
}
