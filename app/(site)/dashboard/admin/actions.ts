"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isUserRole, type UserRole } from "@/lib/types/user-role";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function adminSupabase() {
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

  if (profile?.role !== "admin") {
    redirect("/login");
  }

  return { supabase, adminUserId: user.id };
}

/** Change a user's role; ensures a counselors row exists when promoting to counselor. */
export async function updateUserRole(formData: FormData) {
  const user_id = String(formData.get("user_id") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "").trim();

  if (!user_id || !isUserRole(roleRaw)) {
    redirect("/dashboard/admin?users=invalid");
  }

  const role = roleRaw as UserRole;
  const { supabase, adminUserId } = await adminSupabase();

  if (user_id === adminUserId) {
    redirect("/dashboard/admin?users=self");
  }

  const { error } = await supabase.from("users").update({ role }).eq("id", user_id);

  if (error) {
    redirect("/dashboard/admin?users=error");
  }

  if (role === "counselor") {
    await supabase.from("counselors").upsert(
      { user_id, meeting_link: "" },
      { onConflict: "user_id" },
    );
  }

  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin?users=ok");
}

/** Admin override for a counselor's meeting link. */
export async function adminUpdateCounselorLink(formData: FormData) {
  const counselor_id = String(formData.get("counselor_id") ?? "").trim();
  const meeting_link = String(formData.get("meeting_link") ?? "").trim();

  if (!counselor_id) {
    redirect("/dashboard/admin?counselors=invalid");
  }

  const { supabase } = await adminSupabase();
  const { error } = await supabase
    .from("counselors")
    .update({ meeting_link })
    .eq("id", counselor_id);

  if (error) {
    redirect("/dashboard/admin?counselors=error");
  }

  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin?counselors=ok");
}
