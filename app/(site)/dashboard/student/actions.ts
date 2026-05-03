"use server";

import { sendAppointmentCreatedEmails } from "@/lib/email/appointment-emails";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function studentContext() {
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

  if (profile?.role !== "student") {
    redirect("/login");
  }

  return { supabase, user };
}

/** Book one open slot (trigger marks the slot booked). */
export async function bookSlot(formData: FormData) {
  const slot_id = String(formData.get("slot_id") ?? "").trim();
  if (!slot_id) {
    redirect("/dashboard/student?book=invalid");
  }

  const { supabase, user } = await studentContext();

  const { data: slot, error: slotErr } = await supabase
    .from("time_slots")
    .select("id, counselor_id, is_booked")
    .eq("id", slot_id)
    .maybeSingle();

  if (slotErr || !slot) {
    revalidatePath("/dashboard/student");
    redirect("/dashboard/student?book=unavailable");
  }

  if (slot.is_booked) {
    revalidatePath("/dashboard/student");
    redirect("/dashboard/student?book=unavailable");
  }

  const { data: insertedRows, error: insertErr } = await supabase
    .from("appointments")
    .insert({
      student_id: user.id,
      counselor_id: slot.counselor_id,
      slot_id: slot.id,
      status: "booked",
    })
    .select("id");

  let appointmentId =
    Array.isArray(insertedRows) && insertedRows[0]?.id
      ? String(insertedRows[0].id)
      : undefined;

  if (
    insertErr?.code === "23505" ||
    insertErr?.message?.toLowerCase().includes("unique")
  ) {
    revalidatePath("/dashboard/student");
    redirect("/dashboard/student?book=taken");
  }

  if (insertErr || !appointmentId) {
    if (!appointmentId && !insertErr) {
      const { data: found } = await supabase
        .from("appointments")
        .select("id")
        .eq("slot_id", slot.id)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (found?.id) {
        appointmentId = String(found.id);
      }
    }

    if (!appointmentId) {
      console.error("[bookSlot] insert failed:", insertErr?.message ?? insertErr, {
        code: insertErr?.code,
        hint: insertErr?.hint,
      });
      revalidatePath("/dashboard/student");
      redirect("/dashboard/student?book=error");
    }
  }

  // Notifications are best-effort in production; booking should always succeed silently.
  await sendAppointmentCreatedEmails(supabase, appointmentId, {
    authStudentEmail: user.email,
  });

  revalidatePath("/dashboard/student");
  redirect("/dashboard/student?book=ok");
}

export async function submitFeedback(formData: FormData) {
  const appointment_id = String(formData.get("appointment_id") ?? "").trim();
  const ratingRaw = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (
    !appointment_id ||
    !Number.isInteger(ratingRaw) ||
    ratingRaw < 1 ||
    ratingRaw > 5
  ) {
    redirect("/dashboard/student?fb=invalid");
  }

  const { supabase, user } = await studentContext();

  const { data: appt, error: apptErr } = await supabase
    .from("appointments")
    .select("id, counselor_id, status, student_id")
    .eq("id", appointment_id)
    .eq("student_id", user.id)
    .maybeSingle();

  if (apptErr || !appt || appt.status !== "completed") {
    redirect("/dashboard/student?fb=notready");
  }

  const { error: fbErr } = await supabase.from("feedback").insert({
    appointment_id,
    student_id: user.id,
    counselor_id: appt.counselor_id,
    rating: ratingRaw,
    comment: comment.length > 0 ? comment : null,
  });

  if (fbErr) {
    if (fbErr.code === "23505") {
      redirect("/dashboard/student?fb=duplicate");
    }
    redirect("/dashboard/student?fb=error");
  }

  revalidatePath("/dashboard/student");
  redirect("/dashboard/student?fb=ok");
}