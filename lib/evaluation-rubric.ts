/**
 * Player Performance Evaluation rubric — aligned with ANSA paper form (1–5 scale).
 * Categories aggregate to radar; sub-metrics stored per evaluation.
 */

export const RATING_MIN = 1;
export const RATING_MAX = 5;

export const RATING_SCALE_LABELS: Record<number, string> = {
  1: "Needs improvement",
  2: "Below average",
  3: "Average",
  4: "Above average",
  5: "Outstanding",
};

export interface RubricMetric {
  id: string;
  label: string;
  /** Primary focus on paper form */
  primary?: boolean;
}

export interface RubricCategory {
  id: string;
  label: string;
  metrics: RubricMetric[];
}

/** Full rubric — metric ids are unique across all categories */
export const EVALUATION_RUBRIC: RubricCategory[] = [
  {
    id: "shooting",
    label: "Shooting",
    metrics: [
      { id: "shooting.layup", label: "Lay-up", primary: true },
      { id: "shooting.mechanics_arc", label: "Mechanics & arc", primary: true },
      { id: "shooting.two_point", label: "2-point range" },
      { id: "shooting.three_point", label: "3-point range" },
      { id: "shooting.catch_shoot", label: "Catch & shoot" },
      { id: "shooting.shoot_off_dribble", label: "Shoot off dribble" },
      { id: "shooting.weak_hand", label: "Use of weak hand" },
    ],
  },
  {
    id: "dribbling",
    label: "Dribbling",
    metrics: [
      { id: "dribbling.maintains_control", label: "Maintains control", primary: true },
      { id: "dribbling.sees_court", label: "Sees the court", primary: true },
      { id: "dribbling.both_ways", label: "Goes both ways" },
      { id: "dribbling.handles_pressure", label: "Handles pressure" },
      { id: "dribbling.speed", label: "Speed" },
      { id: "dribbling.dribbles_purpose", label: "Dribbles with purpose" },
      { id: "dribbling.penetrates", label: "Penetrates to hoop" },
    ],
  },
  {
    id: "passing",
    label: "Passing",
    metrics: [
      { id: "passing.timing", label: "Timing", primary: true },
      { id: "passing.catching", label: "Catching", primary: true },
      { id: "passing.avoids_turnovers", label: "Avoids turnovers" },
      { id: "passing.two_handed", label: "Two handed" },
      { id: "passing.one_handed", label: "One handed" },
      { id: "passing.bounce", label: "Bounce pass" },
      { id: "passing.overhead", label: "Overhead" },
    ],
  },
  {
    id: "defense",
    label: "Defense",
    metrics: [
      { id: "defense.position", label: "Position", primary: true },
      { id: "defense.transition", label: "Transition", primary: true },
      { id: "defense.stance", label: "Stance" },
      { id: "defense.on_ball", label: "On ball" },
      { id: "defense.off_ball", label: "Off ball" },
      { id: "defense.close_out", label: "Closes out" },
      { id: "defense.help", label: "Help" },
      { id: "defense.recover", label: "Recover to man" },
    ],
  },
  {
    id: "rebounding",
    label: "Rebounding",
    metrics: [
      { id: "rebounding.anticipates", label: "Anticipates", primary: true },
      { id: "rebounding.goes_for_ball", label: "Goes for the ball", primary: true },
      { id: "rebounding.boxes_out", label: "Boxes out" },
      { id: "rebounding.finds_spot", label: "Finds the right spot" },
      { id: "rebounding.protects_ball", label: "Protects / chins the ball" },
    ],
  },
  {
    id: "athletic",
    label: "Athletic ability",
    metrics: [
      { id: "athletic.speed", label: "Speed" },
      { id: "athletic.quickness", label: "Quickness" },
      { id: "athletic.stamina", label: "Stamina" },
      { id: "athletic.coordination", label: "Coordination" },
    ],
  },
  {
    id: "game_play",
    label: "Game play",
    metrics: [
      { id: "game_play.court_sense", label: "Court sense" },
      { id: "game_play.team_play_assists", label: "Team play / assists", primary: true },
      { id: "game_play.vision", label: "Vision", primary: true },
      { id: "game_play.anticipation", label: "Anticipation", primary: true },
    ],
  },
  {
    id: "coachability",
    label: "Coachability",
    metrics: [
      { id: "coachability.attitude", label: "Attitude" },
      { id: "coachability.accepts_criticism", label: "Accepts criticism" },
      { id: "coachability.focus", label: "Focus" },
      { id: "coachability.interaction_teammates", label: "Interaction with teammates" },
      { id: "coachability.team_play", label: "Team play" },
      { id: "coachability.work_ethic", label: "Work ethic" },
    ],
  },
];

/** Radar shows one spoke per category (average of sub-metrics). Order matches form flow. */
export const RADAR_CATEGORY_ORDER = EVALUATION_RUBRIC.map((c) => c.id);

export const OVERALL_STRENGTH_OPTIONS: { id: string; label: string }[] = [
  { id: "defense", label: "Defense" },
  { id: "dribbling", label: "Dribbling" },
  { id: "passing", label: "Passing" },
  { id: "rebounding", label: "Rebounding" },
  { id: "shooting", label: "Shooting" },
  { id: "court_sense", label: "Court sense" },
];

const METRIC_TO_CATEGORY = new Map<string, string>();
for (const cat of EVALUATION_RUBRIC) {
  for (const m of cat.metrics) {
    METRIC_TO_CATEGORY.set(m.id, cat.id);
  }
}

export function getCategoryIdForMetric(metricKey: string): string | undefined {
  return METRIC_TO_CATEGORY.get(metricKey);
}

/** Average rating (1–5) for each category from a flat metric → score map. */
export function categoryAveragesFromScores(
  scores: Record<string, number>
): Record<string, number> {
  const sums: Record<string, { sum: number; n: number }> = {};
  for (const cat of EVALUATION_RUBRIC) {
    sums[cat.id] = { sum: 0, n: 0 };
  }
  for (const [key, val] of Object.entries(scores)) {
    if (typeof val !== "number" || val < RATING_MIN || val > RATING_MAX) continue;
    const cat = getCategoryIdForMetric(key);
    if (!cat || !sums[cat]) continue;
    sums[cat].sum += val;
    sums[cat].n += 1;
  }
  const out: Record<string, number> = {};
  for (const cat of EVALUATION_RUBRIC) {
    const { sum, n } = sums[cat.id];
    out[cat.id] = n > 0 ? Math.round((sum / n) * 10) / 10 : 0;
  }
  return out;
}

export function defaultScoresObject(): Record<string, number> {
  const o: Record<string, number> = {};
  for (const cat of EVALUATION_RUBRIC) {
    for (const m of cat.metrics) {
      o[m.id] = 3;
    }
  }
  return o;
}

export function getCategoryLabel(id: string): string {
  return EVALUATION_RUBRIC.find((c) => c.id === id)?.label ?? id;
}

export function allMetricIds(): string[] {
  return EVALUATION_RUBRIC.flatMap((c) => c.metrics.map((m) => m.id));
}
