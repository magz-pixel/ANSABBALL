import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleAwareServerClient } from "@/lib/supabase/role-data-client";
import { getCoachAssignedGroupIds } from "@/lib/coach-scope";
import { AttendanceClient } from "@/components/dashboard/attendance-client";

export default async function AttendancePage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = (await supabase.from("users").select("role").eq("id", user?.id ?? "").single()).data;
  if (!profile && admin) {
    profile = (await admin.from("users").select("role").eq("id", user?.id ?? "").single()).data;
  }

  const role = profile?.role ?? "player";
  const client = getRoleAwareServerClient(role, supabase, admin);

  let groups: { id: string; name: string }[] = [];

  if (role === "coach" && user?.id) {
    const ids = await getCoachAssignedGroupIds(supabase, user.id);
    if (ids.length > 0) {
      const { data } = await supabase
        .from("player_groups")
        .select("id, name")
        .in("id", ids)
        .order("name");
      groups = data ?? [];
    }
  } else {
    const { data } = await client.from("player_groups").select("id, name").order("name");
    groups = data ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">Attendance</h1>
        <p className="mt-1 text-black/70">
          {role === "coach"
            ? "Attendance you save here is visible to linked parents and players on their dashboards."
            : "Mark attendance for sessions"}
        </p>
      </div>

      <AttendanceClient
        groups={groups}
        emptyHint={
          role === "coach"
            ? "You are not assigned to any training group yet. Ask an admin to assign you under Dashboard → Groups."
            : undefined
        }
      />
    </div>
  );
}
