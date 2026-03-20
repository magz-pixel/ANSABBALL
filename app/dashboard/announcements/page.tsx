import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddAnnouncementButton } from "@/components/dashboard/add-announcement-button";

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const client = admin ?? supabase;
  const { data: { user } } = await supabase.auth.getUser();
  let profile = user ? (await supabase.from("users").select("role").eq("id", user.id).single()).data : null;
  if (!profile && admin && user) {
    profile = (await admin.from("users").select("role").eq("id", user.id).single()).data;
  }
  const canManage = profile?.role === "admin" || profile?.role === "coach";
  const { data: announcements } = await client
    .from("announcements")
    .select("id, title, content, date")
    .order("date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">Announcements</h1>
          <p className="mt-1 text-black/70">Latest updates from ANSA</p>
        </div>
        {canManage && <AddAnnouncementButton />}
      </div>

      <div className="space-y-4">
        {announcements?.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle>{a.title}</CardTitle>
              <p className="text-sm text-black/60">{a.date}</p>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-black/85">{a.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {(!announcements || announcements.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-black/60">
            No announcements yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
