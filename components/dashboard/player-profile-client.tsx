"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadPlayerReportButton } from "@/components/dashboard/download-player-report-button";
import { DownloadConsentPdfButton } from "@/components/dashboard/download-consent-pdf-button";
import { PlayerEvaluationForm } from "@/components/dashboard/player-evaluation-form";
import { EvaluationCategoryLineChart } from "@/components/dashboard/evaluation-category-line-chart";
import {
  RADAR_CATEGORY_ORDER,
  categoryAveragesFromScores,
  getCategoryLabel,
  RATING_SCALE_LABELS,
} from "@/lib/evaluation-rubric";
import { createClient } from "@/lib/supabase/client";

export interface EvaluationSnapshot {
  id: string;
  evaluated_at: string;
  experience_summary: string | null;
  comments_recommendations: string | null;
  scores: Record<string, number>;
}

interface LegacyLog {
  id: string;
  date: string;
  skill: string;
  value: number;
  coach_notes: string | null;
}

export function PlayerProfileClient({
  playerId,
  playerName,
  initialEvaluations,
  initialLegacyLogs,
  canEdit = false,
  showPdfCard = true,
  showConsentPdfCard = true,
  enableLiveUpdates = true,
}: {
  playerId: string;
  playerName: string;
  initialEvaluations: EvaluationSnapshot[];
  initialLegacyLogs: LegacyLog[];
  canEdit?: boolean;
  /** Hide when parent page already has a download button */
  showPdfCard?: boolean;
  /** Signed participation consent PDF (staff & linked parent) */
  showConsentPdfCard?: boolean;
  /** Poll for new evaluations so parents/players see updates without refresh */
  enableLiveUpdates?: boolean;
}) {
  const [evaluations, setEvaluations] = useState<EvaluationSnapshot[]>(() => initialEvaluations);

  useEffect(() => {
    setEvaluations(initialEvaluations);
  }, [initialEvaluations]);

  useEffect(() => {
    if (!enableLiveUpdates) return;
    // Admins already refresh after submit; parents/players benefit from polling.
    if (canEdit) return;

    const supabase = createClient();
    let cancelled = false;

    async function poll() {
      const { data: rows, error } = await supabase
        .from("player_evaluations")
        .select(
          `
          id,
          evaluated_at,
          experience_summary,
          comments_recommendations,
          player_evaluation_scores (metric_key, value)
        `
        )
        .eq("player_id", playerId)
        .order("evaluated_at", { ascending: true })
        .limit(40);

      if (cancelled || error) return;

      const next: EvaluationSnapshot[] = (rows ?? []).map((row: any) => {
        const raw = row.player_evaluation_scores as { metric_key: string; value: number }[] | null;
        const scores = Object.fromEntries((raw ?? []).map((s) => [s.metric_key, Number(s.value)]));
        return {
          id: row.id,
          evaluated_at: row.evaluated_at,
          experience_summary: row.experience_summary ?? null,
          comments_recommendations: row.comments_recommendations ?? null,
          scores,
        };
      });

      // Only update if something actually changed (avoid re-render loop)
      const prevKey = evaluations.map((e) => `${e.id}:${e.evaluated_at}`).join("|");
      const nextKey = next.map((e) => `${e.id}:${e.evaluated_at}`).join("|");
      if (prevKey !== nextKey) {
        setEvaluations(next);
      }
    }

    // Initial fetch + interval
    poll();
    const id = window.setInterval(poll, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, canEdit, enableLiveUpdates]);

  const latestEvaluation = useMemo(() => {
    if (!evaluations.length) return null;
    return [...evaluations].sort((a, b) =>
      b.evaluated_at.localeCompare(a.evaluated_at)
    )[0];
  }, [evaluations]);

  const radarData = useMemo(() => {
    if (!latestEvaluation) {
      return RADAR_CATEGORY_ORDER.map((id) => ({
        skill: getCategoryLabel(id),
        value: 0,
        fullMark: 5,
      }));
    }
    const avgs = categoryAveragesFromScores(latestEvaluation.scores);
    return RADAR_CATEGORY_ORDER.map((id) => ({
      skill: getCategoryLabel(id),
      value: avgs[id] ?? 0,
      fullMark: 5,
    }));
  }, [latestEvaluation]);

  const lineData = useMemo(() => {
    return evaluations.map((ev) => {
      const avgs = categoryAveragesFromScores(ev.scores);
      const row: Record<string, string | number> = { date: ev.evaluated_at };
      RADAR_CATEGORY_ORDER.forEach((id) => {
        row[id] = avgs[id] ?? 0;
      });
      return row;
    });
  }, [evaluations]);

  return (
    <div className="space-y-6">
      {canEdit && (
        <Card className="border-[#001F3F]/20">
          <CardHeader>
            <CardTitle className="text-xl text-[#001F3F]">
              New evaluation
            </CardTitle>
            <p className="text-sm text-black/70">
              Complete the rubric below (1–5). This replaces the old 0–10 quick log — it
              matches the ANSA paper evaluation form.
            </p>
          </CardHeader>
          <CardContent>
            <PlayerEvaluationForm playerId={playerId} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Category radar (latest evaluation)</CardTitle>
          <p className="text-xs text-black/60">
            Each spoke is the average of that category&apos;s items (1–5).{" "}
            {RATING_SCALE_LABELS[1]} … {RATING_SCALE_LABELS[5]}
          </p>
        </CardHeader>
        <CardContent>
          {!latestEvaluation ? (
            <p className="text-sm text-black/60">
              No evaluation yet. {canEdit ? "Submit one above." : "Check back after coaches evaluate."}
            </p>
          ) : (
            <div className="h-72 min-w-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tickCount={6} />
                  <Radar
                    name={playerName}
                    dataKey="value"
                    stroke="#0066CC"
                    fill="#0066CC"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category trends (over time)</CardTitle>
        </CardHeader>
        <CardContent>
          {lineData.length === 0 ? (
            <p className="text-sm text-black/60">No evaluations to chart yet.</p>
          ) : (
            <EvaluationCategoryLineChart data={lineData} />
          )}
        </CardContent>
      </Card>

      {evaluations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent evaluation notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...evaluations]
              .sort((a, b) => b.evaluated_at.localeCompare(a.evaluated_at))
              .slice(0, 5)
              .map((ev) => (
                <div
                  key={ev.id}
                  className="border-b border-gray-100 pb-3 last:border-0"
                >
                  <p className="text-xs font-medium text-[#0066CC]">
                    {ev.evaluated_at}
                  </p>
                  {ev.comments_recommendations ? (
                    <p className="mt-1 text-sm text-black/85">
                      {ev.comments_recommendations}
                    </p>
                  ) : (
                    <p className="text-sm text-black/50">No comments on file.</p>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {initialLegacyLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Legacy progress logs (0–10)</CardTitle>
            <p className="text-sm text-black/60">
              Older quick logs before the formal rubric. Kept for history only.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {initialLegacyLogs.slice(0, 20).map((l) => (
                <li key={l.id} className="border-b border-gray-50 pb-1">
                  {l.date} · {l.skill} · {l.value}/10
                  {l.coach_notes ? ` — ${l.coach_notes}` : ""}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {showPdfCard || showConsentPdfCard ? (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {showPdfCard ? (
              <div>
                <p className="text-sm font-medium text-[#001F3F]">Evaluation report</p>
                <p className="mt-1 text-sm text-black/70">
                  Printable evaluation-style report with category summary, detailed
                  ratings, comments, and attendance.
                </p>
                <DownloadPlayerReportButton
                  playerId={playerId}
                  playerName={playerName}
                  className="mt-3"
                />
              </div>
            ) : null}
            {showConsentPdfCard ? (
              <div>
                <p className="text-sm font-medium text-[#001F3F]">Participation consent</p>
                <p className="mt-1 text-sm text-black/70">
                  Signed consent for the current version on file.
                </p>
                <DownloadConsentPdfButton
                  playerId={playerId}
                  playerName={playerName}
                  className="mt-3"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
