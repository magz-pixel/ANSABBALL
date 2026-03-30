import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { ParentDashboard } from "@/components/dashboard/parent-dashboard";
import { PlayerDashboard } from "@/components/dashboard/player-dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  let profile: { id: string; role: string; full_name: string | null; approval_status: string } | null =
    (await supabase.from("users").select("id, role, full_name, approval_status").eq("id", user.id).single()).data;

  if (!profile) {
    const admin = createAdminClient();
    if (admin) {
      profile = (await admin.from("users").select("id, role, full_name, approval_status").eq("id", user.id).single()).data;
    }
  }

  const role = (profile?.role as "admin" | "coach" | "parent" | "player") ?? "player";
  const approved = profile?.approval_status === "approved" || role === "admin" || role === "coach";

  if (!approved) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-lg font-semibold">Pending Approval</h2>
        <p className="mt-2 text-sm">Your account is awaiting approval. Contact the ANSA Admin.</p>
      </div>
    );
  }

  if (role === "admin" || role === "coach") {
    return <AdminDashboard userName={profile?.full_name ?? "ANSA Admin"} />;
  }
  if (role === "parent") {
    return <ParentDashboard />;
  }
  return <PlayerDashboard />;
}
