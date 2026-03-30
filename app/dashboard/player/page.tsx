import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillRadarChart } from "@/components/dashboard/skill-radar-chart";
import { getPlayerPhotoUrl } from "@/lib/player-avatar";
import { DownloadConsentPdfButton } from "@/components/dashboard/download-consent-pdf-button";
import { categoryAveragesFromScores, getCategoryLabel } from "@/lib/evaluation-rubric";

const RADAR_KEYS = ["shooting", "dribbling", "passing", "defense", "athletic", "game_play"] as const;

export default async function PlayerProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: player } = await supabase
    .from("players")
    .select("id, name, age, school, photo_url, player_groups(name)")
    .eq("player_user_id", user.id)
    .single();

  if (!player) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#001F3F]">My Profile</h1>
        <Card>
          <CardContent className="py-12 text-center text-black/60">
            <p>No player profile linked to your account.</p>
            <p className="mt-2 text-sm text-black/60">
              If your parent already added you under “My Children”, you can link that profile.
            </p>
            <Link
              href="/dashboard/player/claim"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#0066CC] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Link my profile
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: evalRows } = await supabase
    .from("player_evaluations")
    .select(
      `
      id,
      evaluated_at,
      player_evaluation_scores (metric_key, value)
    `
    )
    .eq("player_id", player.id)
    .order("evaluated_at", { ascending: false })
    .limit(1);

  const latestEval = evalRows?.[0] ?? null;
  const rawScores =
    (latestEval?.player_evaluation_scores as
      | { metric_key: string; value: number }[]
      | null) ?? [];
  const scoreMap = Object.fromEntries(rawScores.map((s) => [s.metric_key, Number(s.value)]));
  const catAvgs = latestEval ? categoryAveragesFromScores(scoreMap) : {};
  // Convert 1–5 rubric to 0–10 so it matches SkillRadarChart.
  const radarData = RADAR_KEYS.map((id) => ({
    skill: getCategoryLabel(id),
    value: Math.round(((catAvgs as any)[id] ?? 0) * 2 * 10) / 10,
    fullMark: 10,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-200 ring-4 ring-[#0066CC]/10">
          <Image
            src={getPlayerPhotoUrl(player.photo_url, player.id)}
            alt={player.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">{player.name}</h1>
          <p className="mt-1 text-black/70">
            Age {player.age ?? "—"} • {(player.player_groups as { name?: string } | null)?.name ?? "—"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Skills (latest evaluation)</CardTitle>
        </CardHeader>
        <CardContent>
          {!latestEval ? (
            <p className="text-sm text-black/60">
              No evaluation yet. This chart will update after a coach submits an evaluation.
            </p>
          ) : (
            <SkillRadarChart data={radarData} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participation consent</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-black/70">
            Download a PDF copy of your signed consent (once on file).
          </p>
          <DownloadConsentPdfButton
            playerId={player.id}
            playerName={player.name}
            className="mt-3"
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link href="/dashboard/journal">
          <Card className="w-48 transition-shadow hover:shadow-xl">
            <CardContent className="p-6">
              <p className="font-semibold text-[#001F3F]">Journal</p>
              <p className="text-sm text-black/70">Log home practice</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/goals">
          <Card className="w-48 transition-shadow hover:shadow-xl">
            <CardContent className="p-6">
              <p className="font-semibold text-[#001F3F]">Goals</p>
              <p className="text-sm text-black/70">Track challenges</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
