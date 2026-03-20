import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Image from "next/image";
import Link from "next/link";
import { AddPlayerButton } from "@/components/dashboard/add-player-button";
import { getPlayerPhotoUrl } from "@/lib/player-avatar";

export default async function PlayersPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const client = admin ?? supabase;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = (await supabase.from("users").select("role").eq("id", user?.id ?? "").single()).data;
  if (!profile && admin) {
    profile = (await admin.from("users").select("role").eq("id", user?.id ?? "").single()).data;
  }

  const canManage = profile?.role === "admin" || profile?.role === "coach";

  const [{ data: players }, { data: groups }] = await Promise.all([
    client.from("players").select(`
      id, name, age, gender, school, status, payment_status, join_date, photo_url,
      player_groups(name)
    `).order("name"),
    client.from("player_groups").select("id, name").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">Players</h1>
          <p className="mt-1 text-black/70">
            Players who sign up and get approved appear automatically. Add manually for parent&apos;s children or walk-ins.
          </p>
        </div>
        {canManage && <AddPlayerButton groups={groups ?? []} />}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lg shadow-gray-200/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="w-12 px-6 py-4"></th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#001F3F]">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#001F3F]">
                  Age
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#001F3F]">
                  School
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#001F3F]">
                  Group
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#001F3F]">
                  Status
                </th>
                {canManage && (
                  <th className="px-6 py-4 text-right text-sm font-semibold text-[#001F3F]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {players?.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200">
                      <Image
                        src={getPlayerPhotoUrl(p.photo_url, p.id)}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/players/${p.id}`}
                      className="font-medium text-[#0066CC] hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-black/80">{p.age ?? "—"}</td>
                  <td className="px-6 py-4 text-black/80">{p.school ?? "—"}</td>
                  <td className="px-6 py-4 text-black/80">
                    {(p.player_groups as { name?: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        p.status === "active"
                          ? "bg-green-100 text-green-800"
                          : p.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {p.status}
                    </span>
                    {p.payment_status === "pending" && (
                      <span className="ml-1 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                        unpaid
                      </span>
                    )}
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/players/${p.id}`}
                        className="text-sm font-medium text-[#0066CC] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!players || players.length === 0) && (
          <div className="py-16 text-center text-black/60">
            No players yet. {canManage && "Add your first player above."}
          </div>
        )}
      </div>
    </div>
  );
}
