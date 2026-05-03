import { dashboardPathForRole } from "@/lib/auth/dashboard-path";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/user-role";
import { isUserRole } from "@/lib/types/user-role";
import { redirect } from "next/navigation";

/**
 * Ensures the visitor is logged in, has a profile row, and matches the expected role.
 */
export async function requireDashboardRole(expected: UserRole) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !isUserRole(profile.role)) {
    redirect("/login");
  }

  if (profile.role !== expected) {
    redirect(dashboardPathForRole(profile.role));
  }

  return { supabase, user, profile };
}
