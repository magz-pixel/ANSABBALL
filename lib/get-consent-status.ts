import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/dashboard";
import { CONSENT_VERSION } from "@/lib/consent-copy";

/**
 * Returns true when the user still needs to complete consent for the current version
 * (player: own profile; parent: any linked child missing consent).
 * Staff never need consent here.
 */
export async function getConsentOutstanding(
  supabase: SupabaseClient,
  userId: string,
  role: UserRole
): Promise<boolean> {
  const first = await getFirstMissingConsentPlayer(supabase, userId, role);
  return first !== null;
}

/** Next player profile that still needs consent for the current version (for forms / redirect). */
export async function getFirstMissingConsentPlayer(
  supabase: SupabaseClient,
  userId: string,
  role: UserRole
): Promise<{ playerId: string; playerName: string } | null> {
  if (role === "admin" || role === "coach") return null;

  if (role === "player") {
    const { data: player } = await supabase
      .from("players")
      .select("id, name")
      .eq("player_user_id", userId)
      .maybeSingle();
    if (!player) return null;
    const { data: row } = await supabase
      .from("player_consents")
      .select("id")
      .eq("player_id", player.id)
      .eq("consent_version", CONSENT_VERSION)
      .maybeSingle();
    if (!row) return { playerId: player.id, playerName: player.name };
    return null;
  }

  if (role === "parent") {
    const { data: children } = await supabase
      .from("players")
      .select("id, name")
      .eq("parent_id", userId)
      .order("name");
    if (!children?.length) return null;
    for (const ch of children) {
      const { data: row } = await supabase
        .from("player_consents")
        .select("id")
        .eq("player_id", ch.id)
        .eq("consent_version", CONSENT_VERSION)
        .maybeSingle();
      if (!row) return { playerId: ch.id, playerName: ch.name };
    }
    return null;
  }

  return null;
}
