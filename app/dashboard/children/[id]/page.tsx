import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerProfileClient } from "@/components/dashboard/player-profile-client";
import type { EvaluationSnapshot } from "@/components/dashboard/player-profile-client";
import { getPlayerPhotoUrl } from "@/lib/player-avatar";
import { DownloadPlayerReportButton } from "@/components/dashboard/download-player-report-button";

export default async function ChildProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: player } = await supabase
    .from("players")
    .select("id, name, age, school, photo_url, player_groups(name)")
    .eq("id", id)
    .eq("parent_id", user.id)
    .single();

  if (!player) notFound();

  const [{ data: evalRows }, { data: progress }] = await Promise.all([
    supabase
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
      .eq("player_id", id)
      .order("evaluated_at", { ascending: true })
      .limit(40),
    supabase
      .from("progress_logs")
      .select("id, date, skill, value, coach_notes")
      .eq("player_id", id)
      .order("date", { ascending: false })
      .limit(50),
  ]);

  const initialEvaluations: EvaluationSnapshot[] = (evalRows ?? []).map(
    (row) => {
      const raw = row.player_evaluation_scores as
        | { metric_key: string; value: number }[]
        | null;
      const scores = Object.fromEntries(
        (raw ?? []).map((s) => [s.metric_key, Number(s.value)])
      );
      return {
        id: row.id,
        evaluated_at: row.evaluated_at,
        experience_summary: row.experience_summary,
        comments_recommendations: row.comments_recommendations,
        scores,
      };
    }
  );

  const { data: attendance } = await supabase
    .from("attendance")
    .select("session_date, present")
    .eq("player_id", id)
    .order("session_date", { ascending: false })
    .limit(14);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/children"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0066CC] hover:underline"
        >
          ← Back to My Children
        </Link>
        <DownloadPlayerReportButton
          playerId={id}
          playerName={player.name}
          variant="default"
        />
      </div>

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
            Age {player.age ?? "—"} •{" "}
            {(player.player_groups as { name?: string } | null)?.name ?? "—"}
          </p>
        </div>
      </div>

      <PlayerProfileClient
        playerId={id}
        playerName={player.name}
        initialEvaluations={initialEvaluations}
        initialLegacyLogs={progress ?? []}
        canEdit={false}
        showPdfCard={false}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance && attendance.length > 0 ? (
            <ul className="space-y-2">
              {attendance.map((a) => (
                <li key={a.session_date} className="flex justify-between">
                  <span>{a.session_date}</span>
                  <span className={a.present ? "text-green-600" : "text-red-600"}>
                    {a.present ? "Present" : "Absent"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-black/60">No attendance records yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
