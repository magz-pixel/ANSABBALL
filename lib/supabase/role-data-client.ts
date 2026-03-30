import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/dashboard";

/**
 * Coaches must use the user-scoped client so RLS (group assignment) applies.
 * Admins may use the service-role client when configured for operational queries.
 */
export function getRoleAwareServerClient(
  role: UserRole | string | undefined,
  supabase: SupabaseClient,
  admin: SupabaseClient | null
): SupabaseClient {
  if (role === "coach") return supabase;
  return admin ?? supabase;
}
