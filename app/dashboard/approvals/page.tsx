import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
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

  if (profile?.role !== "admin") {
    redirect("/dashboard");
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

  const parentIds = (pendingUsers ?? []).filter((u) => u.role === "parent").map((u) => u.id);
  const { data: pendingChildren } = parentIds.length
    ? await client
        .from("players")
        .select("id, name, age, school, parent_id, status")
        .in("parent_id", parentIds)
        .eq("status", "pending")
    : { data: [] };

  const childrenByParent: Record<
    string,
    { id: string; name: string; age: number | null; school: string | null }[]
  > = {};
  (pendingChildren ?? []).forEach((child) => {
    if (!child.parent_id) return;
    if (!childrenByParent[child.parent_id]) childrenByParent[child.parent_id] = [];
    childrenByParent[child.parent_id].push({
      id: child.id,
      name: child.name,
      age: child.age,
      school: child.school,
    });
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">Pending Approvals</h1>
        <p className="mt-1 text-black/70">
          Approve accounts so parents and players can access the full dashboard. Parent approvals also
          activate any children they registered while waiting.
        </p>
      </div>

      <ApprovalsClient
        initialUsers={pendingUsers ?? []}
        profileMap={profileMap}
        childrenByParent={childrenByParent}
      />
    </div>
  );
}
