import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApprovalsClient } from "@/components/dashboard/approvals-client";

export default async function ApprovalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { role: string } | null = (
    await supabase.from("users").select("role").eq("id", user?.id ?? "").single()
  ).data;

  if (!profile) {
    const admin = createAdminClient();
    if (admin) {
      profile = (await admin.from("users").select("role").eq("id", user?.id ?? "").single()).data;
    }
  }

  if (profile?.role !== "admin" && profile?.role !== "coach") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        You do not have permission to view this page.
      </div>
    );
  }

  const client = createAdminClient() ?? supabase;
  const { data: pendingUsers } = await client
    .from("users")
    .select("id, email, full_name, role, created_at")
    .eq("approval_status", "pending")
    .in("role", ["parent", "player"])
    .order("created_at", { ascending: false });

  const playerIds = (pendingUsers ?? [])
    .filter((u) => u.role === "player")
    .map((u) => u.id);
  const { data: playerProfiles } = playerIds.length
    ? await client
        .from("players")
        .select("player_user_id, name, position, school")
        .in("player_user_id", playerIds)
    : { data: [] };
  const profileMap: Record<string, { name: string; position: string | null; school: string | null }> = {};
  (playerProfiles ?? []).forEach((p) => {
    profileMap[p.player_user_id] = {
      name: p.name,
      position: p.position ?? null,
      school: p.school ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">Pending Approvals</h1>
        <p className="mt-1 text-black/70">
          Approve accounts so parents and players can access the full dashboard.
        </p>
      </div>

      <ApprovalsClient initialUsers={pendingUsers ?? []} profileMap={profileMap} />
    </div>
  );
}
