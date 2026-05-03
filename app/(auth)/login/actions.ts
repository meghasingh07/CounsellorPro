"use server";

import { dashboardPathForRole } from "@/lib/auth/dashboard-path";
import {
  isSupabasePublicEnvConfigured,
  supabasePublicEnvHelpMessage,
} from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isUserRole } from "@/lib/types/user-role";
import { redirect } from "next/navigation";

export type LoginState = { error: string } | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (!isSupabasePublicEnvConfigured()) {
    return { error: supabasePublicEnvHelpMessage() };
  }

  const supabase = await createServerSupabaseClient();
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Could not load session." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      error: "Could not load your profile. Please contact support.",
    };
  }

  if (!profile || !isUserRole(profile.role)) {
    return {
      error: "Your account profile is incomplete. Please contact support.",
    };
  }

  redirect(dashboardPathForRole(profile.role));
}