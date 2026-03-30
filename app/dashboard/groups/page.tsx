import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleAwareServerClient } from "@/lib/supabase/role-data-client";
import { getCurrentUserProfile } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddGroupButton } from "@/components/dashboard/add-group-button";
import { GroupCoachAssign } from "@/components/dashboard/group-coach-assign";

export default async function GroupsPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { profile, user } = await getCurrentUserProfile();
  const role = profile?.role ?? "player";
  const client = getRoleAwareServerClient(role, supabase, admin);

  let groups: { id: string; name: string; coach_id: string | null }[] | null;

  if (role === "coach" && user?.id) {
    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!coach?.id) {
      groups = [];
    } else {
      const { data } = await client
        .from("player_groups")
        .select("id, name, coach_id")
        .eq("coach_id", coach.id)
        .order("name");
      groups = data ?? [];
    }
  } else {
    const { data } = await client.from("player_groups").select("id, name, coach_id").order("name");
    groups = data;
  }

  const isAdmin = role === "admin";

  let coachOptions: { id: string; label: string }[] = [];
  if (isAdmin) {
    const { data: coachRows } = await client.from("coaches").select("id, user_id");
    const userIds = [...new Set((coachRows ?? []).map((c) => c.user_id).filter(Boolean))] as string[];
    let userMap = new Map<string, { full_name: string | null; email: string | null }>();
    if (userIds.length > 0) {
      const { data: userRows } = await client
        .from("users")
        .select("id, full_name, email")
        .in("id", userIds);
      userMap = new Map((userRows ?? []).map((u) => [u.id, u]));
    }
    coachOptions =
      coachRows?.map((c) => {
        const u = userMap.get(c.user_id);
        const label = u?.full_name?.trim() || u?.email || "Coach";
        return { id: c.id, label };
      }) ?? [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">Groups</h1>
          <p className="mt-1 text-black/70">
            {isAdmin
              ? "Create training groups and assign a lead coach to each. Coaches only see players in their groups."
              : "Groups you are assigned to appear in Attendance and Players."}
          </p>
        </div>
        {isAdmin && <AddGroupButton />}
      </div>

      {isAdmin && (groups?.length ?? 0) > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#001F3F]">Assign coaches to groups</h2>
          <GroupCoachAssign groups={groups ?? []} coaches={coachOptions} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups?.map((g) => (
          <Card key={g.id}>
            <CardHeader>
              <CardTitle>{g.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-black/70">
                {g.coach_id
                  ? "Coach assigned — see list above for details."
                  : "No coach assigned yet."}
              </p>
              <p className="mt-2 text-xs text-black/50">Group ID: {g.id.slice(0, 8)}…</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {(!groups || groups.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-black/60">
            {role === "coach"
              ? "You are not assigned to any group yet. Ask an admin to assign you under Groups."
              : "No groups yet. Create a group above."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
