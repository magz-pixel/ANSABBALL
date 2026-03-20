import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GoalsClient } from "@/components/dashboard/goals-client";

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("player_user_id", user.id)
    .single();

  const { data: goals } = player
    ? await supabase
        .from("goals")
        .select("id, title, target, current, completed")
        .eq("player_id", player.id)
        .order("completed")
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">Goals</h1>
        <p className="mt-1 text-black/70">Track your challenges and milestones</p>
      </div>

      <GoalsClient playerId={player?.id ?? null} initialGoals={goals ?? []} />
    </div>
  );
}
