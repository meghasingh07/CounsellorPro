import type { SupabaseClient } from "@supabase/supabase-js";

export type CounselorProfile = {
  id: string;
  user_id: string;
  meeting_link: string;
};

function firstRpcRow(data: unknown): CounselorProfile | null {
  if (data == null) return null;
  const rows = Array.isArray(data) ? data : [data];
  const row = rows[0];
  if (!row || typeof row !== "object") return null;
  return row as CounselorProfile;
}

/**
 * Read counselor row: prefers RPC (migration 006) so reads work even if direct SELECT is blocked by RLS.
 */
async function readCounselorProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<CounselorProfile | null> {
  const { data: rpcData, error: rpcErr } = await supabase.rpc(
    "get_my_counselor_profile",
  );

  if (!rpcErr) {
    const fromRpc = firstRpcRow(rpcData);
    if (fromRpc) return fromRpc;
  }

  const { data: direct } = await supabase
    .from("counselors")
    .select("id, user_id, meeting_link")
    .eq("user_id", userId)
    .maybeSingle();

  return direct as CounselorProfile | null;
}

/**
 * Ensures the logged-in counselor has a row in public.counselors (for meeting link + FK targets).
 */
export async function getOrCreateCounselorProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ profile: CounselorProfile | null; error: string | null }> {
  const existing = await readCounselorProfile(supabase, userId);
  if (existing) {
    return { profile: existing, error: null };
  }

  const { error: insertError } = await supabase
    .from("counselors")
    .insert({ user_id: userId, meeting_link: "" });

  const isDuplicateKey =
    insertError?.code === "23505" ||
    insertError?.message?.toLowerCase().includes("duplicate key");

  if (insertError && !isDuplicateKey) {
    return {
      profile: null,
      error: insertError.message,
    };
  }

  const after = await readCounselorProfile(supabase, userId);
  if (after) {
    return { profile: after, error: null };
  }

  return {
    profile: null,
    error:
      "Could not load counselor profile. Run supabase/migrations/006_counselor_profile_rpc.sql in the Supabase SQL editor, then refresh.",
  };
}
