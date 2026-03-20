import type { PlayerReportPayload } from "@/lib/player-report-types";
import {
  EVALUATION_RUBRIC,
  RADAR_CATEGORY_ORDER,
  categoryAveragesFromScores,
  getCategoryLabel,
} from "@/lib/evaluation-rubric";

export function buildDetailedLines(
  scores: Record<string, number>
): { categoryLabel: string; metricLabel: string; value: number }[] {
  const lines: { categoryLabel: string; metricLabel: string; value: number }[] =
    [];
  for (const cat of EVALUATION_RUBRIC) {
    for (const m of cat.metrics) {
      const v = scores[m.id];
      if (v != null && v >= 1 && v <= 5) {
        lines.push({
          categoryLabel: cat.label,
          metricLabel: m.label,
          value: v,
        });
      }
    }
  }
  return lines;
}

export function buildReportPayload(opts: {
  player: Omit<PlayerReportPayload["player"], "groupName">;
  groupName: string | null;
  latestEvaluation: {
    evaluated_at: string;
    experience_summary: string | null;
    comments_recommendations: string | null;
    jersey_number: string | null;
    grade: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    date_of_birth: string | null;
    overall_strengths: string[];
    scores: Record<string, number>;
    coachName: string | null;
  } | null;
  attendance: PlayerReportPayload["attendance"];
}): PlayerReportPayload {
  const generatedAtLabel = new Date().toLocaleString("en-KE", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const evaluation = opts.latestEvaluation
    ? (() => {
        const avgs = categoryAveragesFromScores(opts.latestEvaluation.scores);
        const categoryAverages = RADAR_CATEGORY_ORDER.map((id) => ({
          id,
          label: getCategoryLabel(id),
          value: avgs[id] ?? 0,
        }));
        return {
          evaluatedAt: opts.latestEvaluation.evaluated_at,
          coachName: opts.latestEvaluation.coachName,
          experienceSummary: opts.latestEvaluation.experience_summary,
          commentsRecommendations: opts.latestEvaluation.comments_recommendations,
          jerseyNumber: opts.latestEvaluation.jersey_number,
          grade: opts.latestEvaluation.grade,
          heightCm: opts.latestEvaluation.height_cm,
          weightKg: opts.latestEvaluation.weight_kg,
          dateOfBirth: opts.latestEvaluation.date_of_birth,
          overallStrengths: opts.latestEvaluation.overall_strengths ?? [],
          categoryAverages,
          detailedLines: buildDetailedLines(opts.latestEvaluation.scores),
        };
      })()
    : null;

  return {
    player: { ...opts.player, groupName: opts.groupName },
    generatedAtLabel,
    evaluation,
    attendance: opts.attendance,
    legacyNote: evaluation
      ? null
      : "No formal evaluation recorded yet. Coaches can add one from the player profile.",
  };
}
