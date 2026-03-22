import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getConsentOutstanding } from "@/lib/get-consent-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ needsConsent: false }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.role) {
    return NextResponse.json({ needsConsent: false });
  }

  const needsConsent = await getConsentOutstanding(
    supabase,
    user.id,
    profile.role as "admin" | "coach" | "parent" | "player"
  );

  return NextResponse.json({ needsConsent });
}
