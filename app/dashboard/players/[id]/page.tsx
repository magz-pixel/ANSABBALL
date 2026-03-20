import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PlayerProfileClient } from "@/components/dashboard/player-profile-client";
import { getPlayerPhotoUrl } from "@/lib/player-avatar";
import { getCurrentUserProfile } from "@/lib/dashboard";
import { DownloadPlayerReportButton } from "@/components/dashboard/download-player-report-button";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { profile } = await getCurrentUserProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "coach")) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const { data: player, error } = await supabase
    .from("players")
    .select(
      `
      id, name, age, gender, school, photo_url, position, status, payment_status, join_date,
      player_groups(name)
    `
    )
    .eq("id", id)
    .single();

  if (error || !player) notFound();

  const { data: progressLogs } = await supabase
    .from("progress_logs")
    .select("id, date, skill, value, coach_notes")
    .eq("player_id", id)
    .order("date", { ascending: false })
    .limit(50);

  const groupName =
    (player.player_groups as { name?: string } | null)?.name ?? null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/players"
          className="text-sm text-[#0066CC] hover:underline"
        >
          ← Back to Players
        </Link>
        <DownloadPlayerReportButton
          playerId={id}
          playerName={player.name}
          variant="default"
        />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-80 shrink-0">
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xl shadow-gray-200/50">
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={getPlayerPhotoUrl(player.photo_url, player.id)}
                alt={player.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
                priority
              />
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-[#001F3F]">{player.name}</h1>
              <p className="mt-1 text-black/70">
                Age {player.age ?? "—"} • {player.school ?? "—"}
              </p>
              {player.position && (
                <p className="mt-1 text-sm font-medium text-[#0066CC]">
                  {player.position}
                </p>
              )}
              {groupName && (
                <p className="mt-2 text-sm font-medium text-[#0066CC]">
                  {groupName}
                </p>
              )}
              <div className="mt-4 flex gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    player.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {player.status}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    player.payment_status === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {player.payment_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <PlayerProfileClient
            playerId={id}
            playerName={player.name}
            initialLogs={progressLogs ?? []}
            canEdit
          />
        </div>
      </div>
    </div>
  );
}
