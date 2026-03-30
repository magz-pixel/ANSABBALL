import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleAwareServerClient } from "@/lib/supabase/role-data-client";
import { getCurrentUserProfile } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddGroupButton } from "@/components/dashboard/add-group-button";
import { DeleteGroupButton } from "@/components/dashboard/delete-group-button";
import { GroupCoachAssign } from "@/components/dashboard/group-coach-assign";

type GroupCard = { id: string; name: string; coachIds: string[] };

export default async function GroupsPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { profile, user } = await getCurrentUserProfile();
  const role = profile?.role ?? "player";
  const client = getRoleAwareServerClient(role, supabase, admin);

  let groups: GroupCard[] = [];

  if (role === "coach" && user?.id) {
    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!coach?.id) {
      groups = [];
    } else {
      const { data: links } = await supabase
        .from("player_group_coaches")
        .select("group_id")
        .eq("coach_id", coach.id);
      const groupIds = [...new Set((links ?? []).map((l) => l.group_id))];
      if (groupIds.length === 0) {
        groups = [];
      } else {
        const { data: rows } = await client
          .from("player_groups")
          .select("id, name")
          .in("id", groupIds)
          .order("name");
        groups =
          rows?.map((g) => ({
            id: g.id,
            name: g.name,
            coachIds: [coach.id],
          })) ?? [];
      }
    }
  } else {
    const { data: rows } = await client.from("player_groups").select("id, name").order("name");
    const { data: links } = await client.from("player_group_coaches").select("group_id, coach_id");
    const coachIdsByGroup = new Map<string, string[]>();
    for (const l of links ?? []) {
      const arr = coachIdsByGroup.get(l.group_id) ?? [];
      arr.push(l.coach_id);
      coachIdsByGroup.set(l.group_id, arr);
    }
    groups =
      rows?.map((g) => ({
        id: g.id,
        name: g.name,
        coachIds: coachIdsByGroup.get(g.id) ?? [],
      })) ?? [];
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
              ? "Create groups and assign one or more coaches per group. All assigned coaches can run attendance and evaluations for players in that group."
              : "Groups you are assigned to appear in Attendance and Players."}
          </p>
        </div>
        {isAdmin && <AddGroupButton />}
      </div>

      {isAdmin && groups.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#001F3F]">Assign coaches to groups</h2>
          <GroupCoachAssign groups={groups} coaches={coachOptions} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <Card key={g.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <CardTitle>{g.name}</CardTitle>
              {isAdmin && <DeleteGroupButton groupId={g.id} groupName={g.name} />}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-black/70">
                {g.coachIds.length > 0
                  ? `${g.coachIds.length} coach${g.coachIds.length === 1 ? "" : "es"} assigned${
                      isAdmin ? " — use the checklist above to change." : "."
                    }`
                  : isAdmin
                    ? "No coaches assigned yet — use the checklist above."
                    : "No assignment."}
              </p>
              <p className="mt-2 text-xs text-black/50">Group ID: {g.id.slice(0, 8)}…</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {groups.length === 0 && (
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
