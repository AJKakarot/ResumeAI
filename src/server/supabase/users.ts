import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { UserRow } from "@/types/supabase";

export async function upsertUserByClerkId(
  clerkId: string,
  email: string,
  name: string
): Promise<{ data: UserRow | null; error: Error | null }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      data: null,
      error: new Error("Set SUPABASE_SERVICE_ROLE_KEY (server-side Clerk sync)"),
    };
  }

  const { data, error } = await supabase
    .from("users")
    .upsert(
      { clerk_id: clerkId, email, name },
      { onConflict: "clerk_id" }
    )
    .select("id, clerk_id, email, name, created_at")
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as UserRow, error: null };
}

export async function getUserByClerkId(
  clerkId: string
): Promise<{ data: UserRow | null; error: Error | null }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      data: null,
      error: new Error("Set SUPABASE_SERVICE_ROLE_KEY (server-side Clerk sync)"),
    };
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, clerk_id, email, name, created_at")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as UserRow | null, error: null };
}
