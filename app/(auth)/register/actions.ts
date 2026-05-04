"use server";

import { dashboardPathForRole } from "@/lib/auth/dashboard-path";
import {
  isSupabasePublicEnvConfigured,
  supabasePublicEnvHelpMessage,
} from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isUserRole } from "@/lib/types/user-role";
import { redirect } from "next/navigation";

export type RegisterState = { error?: string; message?: string } | null;

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const role = "student";

  if (!isSupabasePublicEnvConfigured()) {
    return { error: supabasePublicEnvHelpMessage() };
  }

  const supabase = await createServerSupabaseClient();

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  if (!data.session) {
    return {
      message:
        "If email confirmation is enabled, check your inbox then sign in. Otherwise go to Log in.",
    };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { error: "Could not complete signup." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile || !isUserRole(profile.role)) {
    return {
      message:
        "Account created. If login fails, run the SQL migration so public.users exists and try again.",
    };
  }

  redirect(dashboardPathForRole(profile.role));
}
