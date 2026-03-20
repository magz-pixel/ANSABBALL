import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddGroupButton } from "@/components/dashboard/add-group-button";

export default async function GroupsPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const client = admin ?? supabase;
  const { data: groups } = await client
    .from("player_groups")
    .select("id, name, coach_id")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">Groups</h1>
          <p className="mt-1 text-black/70">Manage player groups</p>
        </div>
        <AddGroupButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups?.map((g) => (
          <Card key={g.id}>
            <CardHeader>
              <CardTitle>{g.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-black/70">Group ID: {g.id.slice(0, 8)}...</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {(!groups || groups.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-black/60">
            No groups yet. Create groups via Supabase or add a create form.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
