import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayerPhotoUrl } from "@/lib/player-avatar";

export async function ParentDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: children } = await supabase
    .from("players")
    .select("id, name, age, school, group_id, status, photo_url")
    .eq("parent_id", user.id)
    .order("name");

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, date, content")
    .order("date", { ascending: false })
    .limit(3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">Parent Dashboard</h1>
        <p className="mt-1 text-black/70">View your children&apos;s progress and updates</p>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-[#001F3F]">My Children</h2>
        {children && children.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <Link key={child.id} href={`/dashboard/children/${child.id}`}>
                <Card className="transition-all hover:shadow-xl hover:border-[#0066CC]/30">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-200 ring-2 ring-[#0066CC]/20">
                      <Image
                        src={getPlayerPhotoUrl(child.photo_url, child.id)}
                        alt={child.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-[#001F3F]">{child.name}</p>
                      <p className="text-sm text-black/70">
                        Age {child.age} • {child.school ?? "—"}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${
                          child.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {child.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-black/70">No linked children yet.</p>
              <p className="mt-2 text-sm text-black/60">
                Contact Coach Brian to link your child&apos;s profile.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-[#001F3F]">Announcements</h2>
        {announcements && announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((a) => (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <CardContent className="pt-0 text-sm text-black/70">{a.content}</CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-black/60">
              No announcements yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
