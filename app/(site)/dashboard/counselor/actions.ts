"use server";

import { getOrCreateCounselorProfile } from "@/lib/counselor/get-or-create-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function counselorContext() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { profile, error } = await getOrCreateCounselorProfile(supabase, user.id);
  if (!profile) {
    redirect(
      `/dashboard/counselor?profileError=${encodeURIComponent(error ?? "unknown")}`,
    );
  }

  return { supabase, counselorId: profile.id };
}

/** Save the reusable video/meeting URL shown to students after booking. */
export async function updateMeetingLink(formData: FormData) {
  const meeting_link = String(formData.get("meeting_link") ?? "").trim();
  const { supabase, counselorId } = await counselorContext();
  await supabase.from("counselors").update({ meeting_link }).eq("id", counselorId);
  revalidatePath("/dashboard/counselor");
}

/** Add one availability window on a given calendar day. */
export async function createTimeSlot(formData: FormData) {
  const date = String(formData.get("date") ?? "").trim();
  const start_time = String(formData.get("start_time") ?? "").trim();
  const end_time = String(formData.get("end_time") ?? "").trim();

  if (!date || !start_time || !end_time) {
    redirect("/dashboard/counselor?slot=missing");
  }
  if (start_time >= end_time) {
    redirect("/dashboard/counselor?slot=time");
  }

  const { supabase, counselorId } = await counselorContext();
  const { error } = await supabase.from("time_slots").insert({
    counselor_id: counselorId,
    date,
    start_time,
    end_time,
    is_booked: false,
  });

  if (error) {
    redirect("/dashboard/counselor?slot=db");
  }

  revalidatePath("/dashboard/counselor");
  redirect("/dashboard/counselor");
}

/** Allow counselors to update timing of open (unbooked) slots. */
export async function updateTimeSlot(formData: FormData) {
  const slotId = String(formData.get("slot_id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const start_time = String(formData.get("start_time") ?? "").trim();
  const end_time = String(formData.get("end_time") ?? "").trim();

  if (!slotId || !date || !start_time || !end_time) {
    redirect("/dashboard/counselor?slot=edit-missing");
  }
  if (start_time >= end_time) {
    redirect("/dashboard/counselor?slot=edit-time");
  }

  const { supabase, counselorId } = await counselorContext();
  const { data: slot, error: slotError } = await supabase
    .from("time_slots")
    .select("id, is_booked")
    .eq("id", slotId)
    .eq("counselor_id", counselorId)
    .maybeSingle();

  if (slotError || !slot) {
    redirect("/dashboard/counselor?slot=edit-missing");
  }
  if (slot.is_booked) {
    redirect("/dashboard/counselor?slot=edit-booked");
  }

  const { error: updateError } = await supabase
    .from("time_slots")
    .update({ date, start_time, end_time })
    .eq("id", slotId)
    .eq("counselor_id", counselorId)
    .eq("is_booked", false);

  if (updateError) {
    redirect("/dashboard/counselor?slot=edit-db");
  }

  revalidatePath("/dashboard/counselor");
  revalidatePath("/dashboard/student");
  redirect("/dashboard/counselor");
}

/** Counselor marks session outcome; cancelling frees the slot again. */
export async function setAppointmentStatus(formData: FormData) {
  const appointmentId = String(formData.get("appointment_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (
    !appointmentId ||
    (status !== "completed" && status !== "cancelled")
  ) {
    redirect("/dashboard/counselor?appt=invalid");
  }

  const { supabase, counselorId } = await counselorContext();

  const { data: appt, error: fetchErr } = await supabase
    .from("appointments")
    .select("id, slot_id")
    .eq("id", appointmentId)
    .eq("counselor_id", counselorId)
    .maybeSingle();

  if (fetchErr || !appt) {
    redirect("/dashboard/counselor?appt=missing");
  }

  const { error: statusErr } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId);

  if (statusErr) {
    console.error("[setAppointmentStatus] appointment update:", statusErr.message);
    redirect("/dashboard/counselor?appt=missing");
  }

  if (status === "cancelled") {
    const { error: slotErr } = await supabase
      .from("time_slots")
      .update({ is_booked: false })
      .eq("id", appt.slot_id);
    if (slotErr) {
      console.error("[setAppointmentStatus] slot reopen:", slotErr.message);
    }
  }

  revalidatePath("/dashboard/counselor");
  revalidatePath("/dashboard/student");
  redirect("/dashboard/counselor");
}
