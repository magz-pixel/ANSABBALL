import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCoachButton } from "@/components/dashboard/add-coach-button";

export default async function CoachesPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const client = admin ?? supabase;
  const { data: { user } } = await supabase.auth.getUser();
  let profile = user ? (await supabase.from("users").select("role").eq("id", user.id).single()).data : null;
  if (!profile && admin && user) {
    profile = (await admin.from("users").select("role").eq("id", user.id).single()).data;
  }
  const canManage = profile?.role === "admin";

  const { data: coaches } = await client
    .from("coaches")
    .select(`
      id, bio, user_id,
      users:user_id(full_name, email)
    `);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">Coaches</h1>
          <p className="mt-1 text-black/70">Manage coaching staff</p>
        </div>
        {canManage && <AddCoachButton />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {coaches?.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>
                {(c.users as { full_name?: string; email?: string } | null)?.full_name ??
                  (c.users as { full_name?: string; email?: string } | null)?.email ??
                  `Coach ${c.user_id?.slice(0, 8)}...`}
              </CardTitle>
              <p className="text-sm text-black/70">
                {(c.users as { email?: string } | null)?.email ?? c.user_id?.slice(0, 8) + "..."}
              </p>
            </CardHeader>
            {c.bio && (
              <CardContent className="pt-0 text-sm text-black/70">{c.bio}</CardContent>
            )}
          </Card>
        ))}
      </div>
      {(!coaches || coaches.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-black/60">
            No coaches yet. Add coaches via Supabase users + coaches table.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
