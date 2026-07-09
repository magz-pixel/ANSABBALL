// Neutral placeholder when no player photo is on file.
const PLACEHOLDER = "/brand/player-placeholder.svg";

export function getPlayerPhotoUrl(photoUrl: string | null, _playerId: string): string {
  return photoUrl || PLACEHOLDER;
}
