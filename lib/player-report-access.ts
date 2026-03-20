import type { UserProfile } from "@/lib/dashboard";

/**
 * PDF / player reports: only staff and linked parents (not the player role viewing own profile).
 */
export function canAccessPlayerReport(
  profile: UserProfile,
  player: { parent_id: string | null }
): boolean {
  if (profile.role === "admin" || profile.role === "coach") return true;
  if (profile.role === "parent" && player.parent_id === profile.id) return true;
  return false;
}
