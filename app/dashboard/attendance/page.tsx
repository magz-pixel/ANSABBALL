import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AttendanceClient } from "@/components/dashboard/attendance-client";

export default async function AttendancePage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const client = admin ?? supabase;
  const { data: groups } = await client
    .from("player_groups")
    .select("id, name")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">Attendance</h1>
        <p className="mt-1 text-black/70">Mark attendance for sessions</p>
      </div>

      <AttendanceClient groups={groups ?? []} />
    </div>
  );
}
