import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimPlayerProfile } from "@/components/dashboard/claim-player-profile";

export default async function ClaimPlayerProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">Link profile</h1>
        <p className="mt-1 text-black/70">
          Link your login to an existing child profile created by your parent.
        </p>
      </div>
      <ClaimPlayerProfile />
    </div>
  );
}

