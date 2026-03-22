import type { UserProfile } from "@/lib/dashboard";

export interface PlayerConsentAccessPlayer {
  parent_id: string | null;
  player_user_id: string | null;
}

/**
 * PDF / consent records: staff, linked parent, or the player themself.
 */
export function canAccessPlayerConsent(
  profile: UserProfile,
  player: PlayerConsentAccessPlayer
): boolean {
  if (profile.role === "admin" || profile.role === "coach") return true;
  if (profile.role === "parent" && player.parent_id === profile.id) return true;
  if (profile.role === "player" && player.player_user_id === profile.id) return true;
  return false;
}
