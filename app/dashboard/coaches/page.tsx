import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCoachButton } from "@/components/dashboard/add-coach-button";

type CoachRow = {
  id: string;
  bio: string | null;
  user_id: string;
  photo_url: string | null;
  users: { full_name: string | null; email: string | null } | null;
  profilePending?: boolean;
};

async function fetchCoachesTableRows(client: SupabaseClient): Promise<{ id: string; bio: string | null; user_id: string; photo_url: string | null }[]> {
  const attempt = await client
    .from("coaches")
    .select("id, bio, user_id, photo_url, created_at")
    .order("created_at", { ascending: false });

  if (!attempt.error && attempt.data) {
    return attempt.data.map(({ id, bio, user_id, photo_url }) => ({
      id,
      bio,
      user_id,
      photo_url: photo_url ?? null,
    }));
  }

  const minimal = await client.from("coaches").select("id, bio, user_id").order("id");
  if (minimal.error || !minimal.data) {
    return [];
  }
  return minimal.data.map((r) => ({
    ...r,
    photo_url: null as string | null,
  }));
}

function bucketByUserId<T extends Record<string, unknown>>(
  rows: T[] | null,
  key: keyof T,
  maxPerUser: number
): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const r of rows ?? []) {
    const id = String(r[key] ?? "");
    if (!id || id === "undefined") continue;
    const arr = m.get(id) ?? [];
    if (arr.length >= maxPerUser) continue;
    arr.push(r);
    m.set(id, arr);
  }
  return m;
}

function playerName(row: { players?: unknown }): string {
  const p = row.players as { name?: string } | null;
  return p?.name?.trim() || "Player";
}

export default async function CoachesPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const client = admin ?? supabase;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let profile = user ? (await supabase.from("users").select("role").eq("id", user.id).single()).data : null;
  if (!profile && admin && user) {
    profile = (await admin.from("users").select("role").eq("id", user.id).single()).data;
  }
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }
  const canManage = profile?.role === "admin";

  const coachRows = await fetchCoachesTableRows(client);

  const { data: coachRoleUsers } = await client.from("users").select("id, full_name, email").eq("role", "coach");

  const tableUserIds = new Set(coachRows.map((c) => c.user_id));
  const orphanRoleCoaches = (coachRoleUsers ?? []).filter((u) => !tableUserIds.has(u.id));

  const coachUserIds = [
    ...coachRows.map((c) => c.user_id),
    ...orphanRoleCoaches.map((u) => u.id),
  ].filter(Boolean) as string[];

  let userMap = new Map<string, { full_name: string | null; email: string | null }>();
  if (coachUserIds.length > 0) {
    const { data: userRows } = await client.from("users").select("id, full_name, email").in("id", coachUserIds);
    userMap = new Map((userRows ?? []).map((u) => [u.id, u]));
  }

  const fromTable: CoachRow[] = coachRows.map((c) => ({
    ...c,
    users: userMap.get(c.user_id) ?? null,
  }));

  const fromRoleOnly: CoachRow[] = orphanRoleCoaches.map((u) => ({
    id: `pending-${u.id}`,
    bio: null,
    user_id: u.id,
    photo_url: null,
    users: { full_name: u.full_name, email: u.email },
    profilePending: true,
  }));

  const coaches: CoachRow[] = [...fromTable, ...fromRoleOnly];

  const [{ data: evalRows }, { data: progRows }, { data: attRows }] = await Promise.all([
    coachUserIds.length
      ? client
          .from("player_evaluations")
          .select("coach_user_id, evaluated_at, player_id, players(name)")
          .in("coach_user_id", coachUserIds)
          .order("evaluated_at", { ascending: false })
          .limit(150)
      : Promise.resolve({ data: [] }),
    coachUserIds.length
      ? client
          .from("progress_logs")
          .select("created_by, date, skill, player_id, players(name)")
          .in("created_by", coachUserIds)
          .order("date", { ascending: false })
          .limit(150)
      : Promise.resolve({ data: [] }),
    coachUserIds.length
      ? client
          .from("attendance")
          .select("created_by, session_date, player_id, players(name)")
          .in("created_by", coachUserIds)
          .order("session_date", { ascending: false })
          .limit(150)
      : Promise.resolve({ data: [] }),
  ]);

  const evalBuckets = bucketByUserId(
    (evalRows ?? []) as Record<string, unknown>[],
    "coach_user_id",
    4
  );
  const progBuckets = bucketByUserId(
    (progRows ?? []) as Record<string, unknown>[],
    "created_by",
    4
  );
  const attBuckets = bucketByUserId(
    (attRows ?? []) as Record<string, unknown>[],
    "created_by",
    4
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">Coaches</h1>
          <p className="mt-1 text-black/70">Manage coaching staff and review recent activity</p>
        </div>
        {canManage && <AddCoachButton />}
      </div>

      {orphanRoleCoaches.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Coach accounts without a staff profile row</p>
          <p className="mt-1 text-amber-900/90">
            Some users have role &quot;coach&quot; but no row in the coaches table (e.g. role set in Supabase only).
            Use <strong>Add Coach</strong> with their email to create the staff profile so assignments and the list stay
            in sync.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {coaches.map((c) => {
          const uid = c.user_id;
          const evs = evalBuckets.get(uid) ?? [];
          const prs = progBuckets.get(uid) ?? [];
          const ats = attBuckets.get(uid) ?? [];

          return (
            <Card
              key={c.id}
              className={c.profilePending ? "border-amber-200/80 bg-amber-50/30" : undefined}
            >
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-200">
                  {c.photo_url ? (
                    <Image
                      src={c.photo_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-black/40">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle>
                    {c.users?.full_name?.trim() || c.users?.email || `Coach ${c.user_id?.slice(0, 8)}…`}
                  </CardTitle>
                  <p className="text-sm text-black/70">{c.users?.email}</p>
                  {c.profilePending && (
                    <p className="mt-2 text-xs font-medium text-amber-800">
                      Staff profile incomplete — use Add Coach with this email to link the profile.
                    </p>
                  )}
                </div>
              </CardHeader>
              {c.bio && <CardContent className="pt-0 text-sm text-black/70">{c.bio}</CardContent>}
              <CardContent className="pt-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Recent activity</p>
                <ul className="mt-2 space-y-2 text-sm text-black/80">
                  {evs.length === 0 && prs.length === 0 && ats.length === 0 && (
                    <li className="text-black/60">No evaluations, progress logs, or attendance yet.</li>
                  )}
                  {evs.map((row, i) => (
                    <li key={`e-${c.id}-${i}`}>
                      <span className="font-medium text-[#0066CC]">Evaluation</span> —{" "}
                      {playerName(row as { players?: unknown })} on{" "}
                      {String((row as { evaluated_at?: string }).evaluated_at ?? "—")}
                    </li>
                  ))}
                  {prs.map((row, i) => (
                    <li key={`p-${c.id}-${i}`}>
                      <span className="font-medium text-[#0066CC]">Progress</span> —{" "}
                      {(row as { skill?: string }).skill} for {playerName(row as { players?: unknown })} (
                      {String((row as { date?: string }).date ?? "—")})
                    </li>
                  ))}
                  {ats.map((row, i) => (
                    <li key={`a-${c.id}-${i}`}>
                      <span className="font-medium text-[#0066CC]">Attendance</span> —{" "}
                      {playerName(row as { players?: unknown })} on{" "}
                      {String((row as { session_date?: string }).session_date ?? "—")}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {coaches.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-black/60">
            No coaches yet. Add a coach using the button above (they must sign up first).
          </CardContent>
        </Card>
      )}
    </div>
  );
}
