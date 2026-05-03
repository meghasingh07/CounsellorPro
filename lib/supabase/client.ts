import {
  isSupabasePublicEnvConfigured,
  supabasePublicEnvHelpMessage,
} from "@/lib/supabase/env";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — use in Client Components and event handlers.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!isSupabasePublicEnvConfigured() || !url || !anonKey) {
    throw new Error(supabasePublicEnvHelpMessage());
  }

  return createBrowserClient(url, anonKey);
}
