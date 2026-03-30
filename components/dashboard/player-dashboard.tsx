import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function PlayerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: player } = await supabase
    .from("players")
    .select("id, name, age, school, group_id, photo_url")
    .eq("player_user_id", user.id)
    .single();

  const { data: recentProgress } = await supabase
    .from("progress_logs")
    .select("skill, value, date")
    .eq("player_id", player?.id ?? "")
    .order("date", { ascending: false })
    .limit(5);

  const { data: goals } = await supabase
    .from("goals")
    .select("id, title, target, current, completed")
    .eq("player_id", player?.id ?? "")
    .limit(3);

  if (!player) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-[#001F3F]">Player Dashboard</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-black/70">No player profile linked to your account.</p>
            <p className="mt-2 text-sm text-black/60">
              If your parent already added you under “My Children”, you can link it now.
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">My Dashboard</h1>
        <p className="mt-1 text-black/70">Welcome back, {player.name}!</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/player">
          <Card className="transition-shadow hover:shadow-xl">
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardContent className="pt-0 text-sm text-black/70">
                View stats and progress
              </CardContent>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/journal">
          <Card className="transition-shadow hover:shadow-xl">
            <CardHeader>
              <CardTitle>Journal</CardTitle>
              <CardContent className="pt-0 text-sm text-black/70">
                Log home practice
              </CardContent>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/goals">
          <Card className="transition-shadow hover:shadow-xl">
            <CardHeader>
              <CardTitle>Goals</CardTitle>
              <CardContent className="pt-0 text-sm text-black/70">
                Track your challenges
              </CardContent>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Progress</CardTitle>
            <CardDescription>Your latest skill ratings</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProgress && recentProgress.length > 0 ? (
              <ul className="space-y-2">
                {recentProgress.map((p, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-black/80">{p.skill}</span>
                    <span className="font-medium text-[#0066CC]">{p.value}/10</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-black/60">No progress logs yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Goals</CardTitle>
            <CardDescription>Active challenges</CardDescription>
          </CardHeader>
          <CardContent>
            {goals && goals.length > 0 ? (
              <ul className="space-y-3">
                {goals.map((g) => (
                  <li key={g.id}>
                    <p className="font-medium">{g.title}</p>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-[#0066CC]"
                        style={{
                          width: `${Math.min(100, (Number(g.current) / Number(g.target)) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-black/60">
                      {g.current} / {g.target}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-black/60">No goals yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
