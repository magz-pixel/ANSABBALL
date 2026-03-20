"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  EVALUATION_RUBRIC,
  OVERALL_STRENGTH_OPTIONS,
  RATING_MAX,
  RATING_MIN,
  RATING_SCALE_LABELS,
  defaultScoresObject,
} from "@/lib/evaluation-rubric";

export function PlayerEvaluationForm({ playerId }: { playerId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>(() => defaultScoresObject());
  const [evaluatedAt, setEvaluatedAt] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [experienceSummary, setExperienceSummary] = useState("");
  const [comments, setComments] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [grade, setGrade] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [overallStrengths, setOverallStrengths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const strengthToggle = (id: string) => {
    setOverallStrengths((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const ratingButtons = useMemo(
    () =>
      Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => RATING_MIN + i),
    []
  );

  function setMetric(key: string, v: number) {
    setScores((s) => ({ ...s, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      setLoading(false);
      return;
    }

    const { data: evaluation, error: evErr } = await supabase
      .from("player_evaluations")
      .insert({
        player_id: playerId,
        evaluated_at: evaluatedAt,
        coach_user_id: user.id,
        experience_summary: experienceSummary.trim() || null,
        comments_recommendations: comments.trim() || null,
        jersey_number: jerseyNumber.trim() || null,
        grade: grade.trim() || null,
        height_cm: heightCm ? parseInt(heightCm, 10) : null,
        weight_kg: weightKg ? parseInt(weightKg, 10) : null,
        date_of_birth: dateOfBirth || null,
        overall_strengths: overallStrengths,
      })
      .select("id")
      .single();

    if (evErr || !evaluation) {
      setError(evErr?.message ?? "Could not save evaluation.");
      setLoading(false);
      return;
    }

    const rows = Object.entries(scores).map(([metric_key, value]) => ({
      evaluation_id: evaluation.id,
      metric_key,
      value: Math.round(Math.min(RATING_MAX, Math.max(RATING_MIN, value))),
    }));

    const { error: scErr } = await supabase
      .from("player_evaluation_scores")
      .insert(rows);

    if (scErr) {
      setError(scErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setScores(defaultScoresObject());
    setExperienceSummary("");
    setComments("");
    setJerseyNumber("");
    setGrade("");
    setHeightCm("");
    setWeightKg("");
    setDateOfBirth("");
    setOverallStrengths([]);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-[#0066CC]/30 bg-[#0066CC]/5">
        <CardHeader>
          <CardTitle className="text-lg">Player performance evaluation</CardTitle>
          <p className="text-sm text-black/70">
            Rate each item <strong>1–5</strong> ({RATING_SCALE_LABELS[1]} …{" "}
            {RATING_SCALE_LABELS[5]}). Submit saves a full snapshot for this player.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="eval-date">Evaluation date</Label>
            <Input
              id="eval-date"
              type="date"
              required
              value={evaluatedAt}
              onChange={(e) => setEvaluatedAt(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="jersey">Player #</Label>
            <Input
              id="jersey"
              value={jerseyNumber}
              onChange={(e) => setJerseyNumber(e.target.value)}
              placeholder="e.g. 12"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="grade">Grade</Label>
            <Input
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. Grade 8"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="h">Height (cm)</Label>
            <Input
              id="h"
              inputMode="numeric"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="optional"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="w">Weight (kg)</Label>
            <Input
              id="w"
              inputMode="numeric"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="optional"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Experience with player</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="min-h-[88px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0066CC] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
            value={experienceSummary}
            onChange={(e) => setExperienceSummary(e.target.value)}
            placeholder="High-level summary of your experience coaching this player…"
          />
        </CardContent>
      </Card>

      {EVALUATION_RUBRIC.map((cat) => (
        <Card key={cat.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#001F3F]">{cat.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cat.metrics.map((m) => (
              <div
                key={m.id}
                className="flex flex-col gap-2 border-b border-gray-100 pb-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm text-black/85">
                  {m.label}
                  {m.primary ? (
                    <span className="ml-1 text-xs text-[#0066CC]">*</span>
                  ) : null}
                </span>
                <div className="flex flex-wrap gap-1">
                  {ratingButtons.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMetric(m.id, n)}
                      className={`min-h-[44px] min-w-[44px] rounded-md text-sm font-medium transition-colors touch-manipulation sm:min-h-[40px] sm:min-w-[40px] ${
                          scores[m.id] === n
                            ? "bg-[#0066CC] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall strengths (select any)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {OVERALL_STRENGTH_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => strengthToggle(o.id)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                overallStrengths.includes(o.id)
                  ? "border-[#0066CC] bg-[#0066CC] text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {o.label}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comments / recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="min-h-[120px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0066CC] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Training focus, game situations, positions to work on…"
          />
        </CardContent>
      </Card>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0066CC] py-6 text-base font-semibold text-white hover:bg-blue-700 sm:w-auto"
      >
        {loading ? "Saving evaluation…" : "Submit evaluation"}
      </Button>
    </form>
  );
}
