import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function AdminDashboard({ userName = "ANSA Admin" }: { userName?: string }) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const client = admin ?? supabase;

  const [{ count: playersCount }, { count: pendingApprovals }, { data: recentProgress }] =
    await Promise.all([
      client.from("players").select("*", { count: "exact", head: true }),
      client
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "pending")
        .in("role", ["parent", "player"]),
      client
        .from("progress_logs")
        .select("id, player_id, date, skill, value, coach_notes")
        .order("date", { ascending: false })
        .limit(5),
    ]);

  const activePlayers = playersCount ?? 0;
  const pending = pendingApprovals ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">{userName}&apos;s Admin Dashboard</h1>
        <p className="mt-1 text-black/70">Overview of ANSA Basketball Academy</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg shadow-[#0066CC]/10 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black/70">
              Active Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#0066CC]">{activePlayers}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-amber-500/10 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black/70">
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{pending}</p>
            {pending > 0 && (
              <Link
                href="/dashboard/approvals"
                className="mt-2 inline-block text-sm font-medium text-[#0066CC] hover:underline"
              >
                Review →
              </Link>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black/70">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/players?add=1"
                className="rounded-lg bg-[#0066CC] px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Player
              </Link>
              <Link
                href="/dashboard/attendance"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
              >
                Take Attendance
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black/70">
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/announcements"
              className="text-sm font-medium text-[#0066CC] hover:underline"
            >
              View all →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Progress Logs</CardTitle>
            <CardDescription>Latest skill updates from coaches</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProgress && recentProgress.length > 0 ? (
              <ul className="space-y-3">
                {recentProgress.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="font-medium text-[#001F3F]">
                        {log.skill}: {log.value}/10
                      </p>
                      <p className="text-xs text-black/60">{log.date}</p>
                    </div>
                    {log.coach_notes && (
                      <p className="max-w-[200px] truncate text-sm text-black/70">
                        {log.coach_notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-black/60">No progress logs yet.</p>
            )}
            <Link
              href="/dashboard/progress"
              className="mt-4 inline-block text-sm font-medium text-[#0066CC] hover:underline"
            >
              View all progress →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Navigate to key sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Link
                href="/dashboard/players"
                className="rounded-lg border border-gray-200 p-3 font-medium text-[#001F3F] transition-colors hover:bg-gray-50"
              >
                Players List
              </Link>
              <Link
                href="/dashboard/groups"
                className="rounded-lg border border-gray-200 p-3 font-medium text-[#001F3F] transition-colors hover:bg-gray-50"
              >
                Manage Groups
              </Link>
              <Link
                href="/dashboard/coaches"
                className="rounded-lg border border-gray-200 p-3 font-medium text-[#001F3F] transition-colors hover:bg-gray-50"
              >
                Manage Coaches
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
