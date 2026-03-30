import type { SupabaseClient } from "@supabase/supabase-js";

/** Returns group UUIDs assigned to this coach via `player_groups.coach_id`, or [] if not a coach / no row. */
export async function getCoachAssignedGroupIds(
  supabase: SupabaseClient,
  authUserId: string
): Promise<string[]> {
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", authUserId)
    .maybeSingle();
  if (!coach?.id) return [];

  const { data: groups } = await supabase
    .from("player_groups")
    .select("id")
    .eq("coach_id", coach.id);

  return (groups ?? []).map((g) => g.id);
}

export async function coachCanAccessPlayer(
  supabase: SupabaseClient,
  authUserId: string,
  playerId: string
): Promise<boolean> {
  const { data: row } = await supabase.from("players").select("id").eq("id", playerId).maybeSingle();
  return !!row;
}
