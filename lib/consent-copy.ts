/** Frozen version id — bump when legal text changes; users must re-sign new version */
export const CONSENT_VERSION = "2026-03-v1";

export const CONSENT_TITLE = "ANSA Basketball Academy — Participation & consent";

export const CONSENT_INTRO =
  "By signing below, I confirm that I have read and agree to the following:";

export const CONSENT_SECTIONS: { id: string; title: string; body: string }[] = [
  {
    id: "activities",
    title: "1. Activities",
    body: "I consent to the participant taking part in basketball training, games, and related activities organised by ANSA Basketball Academy (“ANSA”).",
  },
  {
    id: "risk",
    title: "2. Nature of sport",
    body: "I understand that basketball involves physical exertion and contact and carries a risk of injury. I accept these risks on behalf of the participant (or as the participant, if signing for myself).",
  },
  {
    id: "health",
    title: "3. Health",
    body: "I confirm that the participant is in adequate health to participate unless I have informed ANSA in writing of relevant medical conditions or restrictions.",
  },
  {
    id: "emergency",
    title: "4. Emergency",
    body: "If the participant requires urgent medical care and I cannot be reached immediately, I authorise ANSA staff to seek emergency medical treatment as deemed necessary.",
  },
  {
    id: "media",
    title: "5. Photos & video",
    body: "I consent to ANSA capturing and using photos or video of the participant in academy-related materials (e.g. website, social media, reports) unless I notify ANSA in writing that I do not consent.",
  },
  {
    id: "data",
    title: "6. Data",
    body: "I understand that ANSA will process personal and contact information for registration, coaching, safety, and communication in line with its privacy practices.",
  },
  {
    id: "conduct",
    title: "7. Rules & conduct",
    body: "The participant will follow ANSA and venue rules and treat coaches, staff, and other players with respect.",
  },
];

export function relationshipLabel(
  r: "self" | "parent_guardian" | "other",
  other?: string | null
): string {
  if (r === "self") return "Self";
  if (r === "parent_guardian") return "Parent / guardian";
  return other?.trim() ? `Other (${other.trim()})` : "Other";
}
