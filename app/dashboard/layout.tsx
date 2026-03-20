import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { PendingApprovalWrapper } from "@/components/dashboard/pending-approval-wrapper";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  let profile: { id: string; email: string; role: string; full_name: string | null; approval_status: string } | null = null;

  const { data: profileData } = await supabase
    .from("users")
    .select("id, email, role, full_name, approval_status")
    .eq("id", user.id)
    .single();

  profile = profileData;

  if (!profile) {
    const adminClient = createAdminClient();
    if (adminClient) {
      const { data: adminProfile } = await adminClient
        .from("users")
        .select("id, email, role, full_name, approval_status")
        .eq("id", user.id)
        .single();
      profile = adminProfile;
    }
  }

  const role = (profile?.role as "admin" | "coach" | "parent" | "player") ?? "player";
  const approvalStatus = (profile?.approval_status as "pending" | "approved" | "rejected") ?? "pending";

  let hasPlayerProfile = false;
  if (role === "player") {
    const client = createAdminClient() ?? supabase;
    const { data: playerRow } = await client
      .from("players")
      .select("id")
      .eq("player_user_id", user.id)
      .maybeSingle();
    hasPlayerProfile = !!playerRow;
  }

  const isAdminOrCoach = role === "admin" || role === "coach";
  const canAccessFullDashboard = isAdminOrCoach || approvalStatus === "approved";

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h2 className="text-lg font-semibold">Profile Not Found</h2>
          <p className="mt-2 text-sm">
            Your account exists but no profile was found. The <strong>id</strong> in your users row
            must exactly match your auth user ID.
          </p>
          <p className="mt-4 text-sm font-medium">Fix:</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
            <li>Supabase → <strong>Authentication</strong> → Users → copy your <strong>User UID</strong></li>
            <li>Table Editor → <strong>public</strong> → <strong>users</strong> → find your row</li>
            <li>Set <code className="rounded bg-amber-100 px-1">id</code> = that exact UID (paste, no spaces)</li>
            <li>Set <code className="rounded bg-amber-100 px-1">role</code> = admin,{" "}
              <code className="rounded bg-amber-100 px-1">approval_status</code> = approved</li>
            <li>Add <code className="rounded bg-amber-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> to .env.local (from Supabase → Settings → API)</li>
            <li>Restart dev server, sign out, sign back in</li>
          </ol>
          <form action="/auth/signout" method="POST" className="mt-6">
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {canAccessFullDashboard ? (
        <DashboardSidebar role={role} />
      ) : (
        <div className="hidden lg:block w-64 shrink-0 border-r border-gray-200 bg-[#001F3F]" />
      )}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        {canAccessFullDashboard ? (
          <div className="p-6 lg:p-8">{children}</div>
        ) : (
          <PendingApprovalWrapper
            userId={user.id}
            email={user.email ?? ""}
            fullName={profile?.full_name ?? ""}
            role={role}
            hasPlayerProfile={hasPlayerProfile}
          />
        )}
      </main>
    </div>
  );
}
