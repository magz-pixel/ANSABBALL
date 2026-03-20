/** Skills tracked in progress logs — keep in sync across dashboard + PDF reports */
export const PLAYER_SKILLS = [
  "dribbling",
  "shooting",
  "defense",
  "free_throws",
  "vertical",
  "passing",
] as const;

export type PlayerSkill = (typeof PLAYER_SKILLS)[number];

export function formatSkillLabel(skill: string): string {
  return skill.replace(/_/g, " ");
}
