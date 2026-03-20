import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JournalClient } from "@/components/dashboard/journal-client";

export default async function JournalPage() {
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

  const { data: entries } = player
    ? await supabase
        .from("journal_entries")
        .select("id, date, entry")
        .eq("player_id", player.id)
        .order("date", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">Journal</h1>
        <p className="mt-1 text-black/70">Log your home practice and thoughts</p>
      </div>

      <JournalClient playerId={player?.id ?? null} initialEntries={entries ?? []} />
    </div>
  );
}
