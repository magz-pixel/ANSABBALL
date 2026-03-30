import type { SupabaseClient } from "@supabase/supabase-js";

/** Group UUIDs where this coach is linked via `player_group_coaches` (multiple coaches per group supported). */
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

  const { data: links } = await supabase
    .from("player_group_coaches")
    .select("group_id")
    .eq("coach_id", coach.id);

  const ids = [...new Set((links ?? []).map((l) => l.group_id))];
  return ids;
}

export async function coachCanAccessPlayer(
  supabase: SupabaseClient,
  _authUserId: string,
  playerId: string
): Promise<boolean> {
  const { data: row } = await supabase.from("players").select("id").eq("id", playerId).maybeSingle();
  return !!row;
}
