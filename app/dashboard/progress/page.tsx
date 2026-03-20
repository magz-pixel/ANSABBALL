import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProgressPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const client = admin ?? supabase;
  const { data: players } = await client
    .from("players")
    .select("id, name, player_groups(name)")
    .eq("status", "active")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">Progress</h1>
        <p className="mt-1 text-black/70">View and log player progress</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {players?.map((p) => (
          <Link key={p.id} href={`/dashboard/players/${p.id}`}>
            <Card className="transition-shadow hover:shadow-xl">
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardContent className="pt-0 text-sm text-[#0066CC]">
                  {(p.player_groups as { name?: string } | null)?.name ?? "—"}
                </CardContent>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      {(!players || players.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-black/60">
            No active players. Add players first.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
