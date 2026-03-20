import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressLineChart } from "@/components/dashboard/progress-line-chart";
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

  const { data: progress } = await supabase
    .from("progress_logs")
    .select("date, skill, value, coach_notes")
    .eq("player_id", id)
    .order("date");

  const { data: attendance } = await supabase
    .from("attendance")
    .select("session_date, present")
    .eq("player_id", id)
    .order("session_date", { ascending: false })
    .limit(14);

  const chartData = (progress ?? []).reduce((acc, p) => {
    const existing = acc.find((x) => x.date === p.date);
    if (existing) existing[p.skill] = p.value;
    else acc.push({ date: p.date, [p.skill]: p.value } as Record<string, string | number>);
    return acc;
  }, [] as Record<string, string | number>[]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard/children" className="inline-flex items-center gap-2 text-sm font-medium text-[#0066CC] hover:underline">
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
            Age {player.age ?? "—"} • {(player.player_groups as { name?: string } | null)?.name ?? "—"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ProgressLineChart data={chartData} />
          ) : (
            <p className="text-black/60">No progress data yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Coach Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {progress?.filter((p) => p.coach_notes).length ? (
            <ul className="space-y-3">
              {progress
                .filter((p) => p.coach_notes)
                .slice(0, 10)
                .map((p, i) => (
                  <li key={i} className="border-b border-gray-100 pb-2 last:border-0">
                    <p className="text-sm text-black/70">{p.date}</p>
                    <p className="text-black/85">{p.coach_notes}</p>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-black/60">No coach notes yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
