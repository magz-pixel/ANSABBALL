import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, role, approval_status")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">Profile</h1>
        <p className="mt-1 text-black/70">Your account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-black/70">Email</p>
            <p className="text-black/90">{profile?.email ?? user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-black/70">Name</p>
            <p className="text-black/90">{profile?.full_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-black/70">Role</p>
            <p className="text-black/90">{profile?.role ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-black/70">Status</p>
            <p className="text-black/90">{profile?.approval_status ?? "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password & sign-in</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
          <p className="mt-6 text-sm text-black/60">
            Forgot your password?{" "}
            <Link
              href="/auth/forgot-password"
              className="font-medium text-[#0066CC] hover:underline"
            >
              Send a reset link to your email
            </Link>{" "}
            (use from the login page when signed out).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
