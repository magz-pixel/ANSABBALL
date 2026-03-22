import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getFirstMissingConsentPlayer } from "@/lib/get-consent-status";
import { ConsentForm } from "@/components/dashboard/consent-form";
import type { UserRole } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function ConsentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.role) redirect("/dashboard");

  const role = profile.role as UserRole;
  if (role === "admin" || role === "coach") {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow">
        <h1 className="text-xl font-bold text-[#001F3F]">Consent</h1>
        <p className="mt-2 text-black/70">
          Staff accounts don&apos;t sign the participant consent. Use{" "}
          <Link href="/dashboard/players" className="font-medium text-[#0066CC] hover:underline">
            Players
          </Link>{" "}
          to view player records and download consent PDFs where available.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block text-sm font-medium text-[#0066CC] hover:underline"
        >
          ← Dashboard home
        </Link>
      </div>
    );
  }

  const missing = await getFirstMissingConsentPlayer(supabase, user.id, role);
  if (!missing) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#001F3F]">Participation consent</h1>
        <p className="mt-1 text-sm text-black/70">
          Please read and sign for each participant linked to your account. A PDF copy can be
          downloaded later from the player profile.
        </p>
      </div>
      <ConsentForm
        playerId={missing.playerId}
        playerName={missing.playerName}
        compact={false}
      />
    </div>
  );
}
