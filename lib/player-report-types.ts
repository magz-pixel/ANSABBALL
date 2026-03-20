/** PDF payload — formal evaluation + attendance (legacy progress optional note) */

export interface PlayerReportPayload {
  player: {
    name: string;
    age: number | null;
    gender: string | null;
    school: string | null;
    position: string | null;
    status: string | null;
    payment_status: string | null;
    join_date: string | null;
    groupName: string | null;
  };
  generatedAtLabel: string;
  evaluation: {
    evaluatedAt: string;
    coachName: string | null;
    experienceSummary: string | null;
    commentsRecommendations: string | null;
    jerseyNumber: string | null;
    grade: string | null;
    heightCm: number | null;
    weightKg: number | null;
    dateOfBirth: string | null;
    overallStrengths: string[];
    /** Category id → average 1–5 */
    categoryAverages: { id: string; label: string; value: number }[];
    /** Flat list for detailed section */
    detailedLines: { categoryLabel: string; metricLabel: string; value: number }[];
  } | null;
  attendance: { session_date: string; present: boolean }[];
  /** When no formal evaluation exists yet */
  legacyNote: string | null;
}
