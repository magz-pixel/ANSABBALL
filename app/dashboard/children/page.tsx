import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPlayerPhotoUrl } from "@/lib/player-avatar";

export default async function ChildrenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: children } = await supabase
    .from("players")
    .select("id, name, age, school, status, photo_url, player_groups(name)")
    .eq("parent_id", user.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">My Children</h1>
          <p className="mt-1 text-black/70">View your children&apos;s profiles</p>
        </div>
        <Link href="/dashboard/children/add">
          <Button className="bg-[#0066CC] text-white hover:bg-blue-700">
            Add another child
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children?.map((c) => (
          <Link key={c.id} href={`/dashboard/children/${c.id}`}>
            <Card className="transition-all hover:shadow-xl hover:border-[#0066CC]/30">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-200 ring-2 ring-[#0066CC]/20">
                  <Image
                    src={getPlayerPhotoUrl(c.photo_url, c.id)}
                    alt={c.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div>
                  <p className="font-semibold text-[#001F3F]">{c.name}</p>
                  <p className="text-sm text-black/70">
                    Age {c.age ?? "—"} • {(c.player_groups as { name?: string } | null)?.name ?? "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {(!children || children.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-black/60">
            No linked children. Contact the ANSA Admin.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
