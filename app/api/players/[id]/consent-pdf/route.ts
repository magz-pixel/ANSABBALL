import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/dashboard";
import { canAccessPlayerConsent } from "@/lib/player-consent-access";
import { buildConsentPdfDocument } from "@/lib/consent-pdf";
import { CONSENT_VERSION } from "@/lib/consent-copy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sanitizeFilename(name: string): string {
  return (
    name
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "player"
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: playerId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { profile } = await getCurrentUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("id, name, parent_id, player_user_id")
    .eq("id", playerId)
    .maybeSingle();

  if (playerError || !player) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    !canAccessPlayerConsent(profile, {
      parent_id: player.parent_id,
      player_user_id: player.player_user_id,
    })
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: consent, error: consentError } = await supabase
    .from("player_consents")
    .select(
      "signer_printed_name, signer_relationship, signer_relationship_other, signed_at, consent_version"
    )
    .eq("player_id", playerId)
    .eq("consent_version", CONSENT_VERSION)
    .order("signed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (consentError || !consent) {
    return NextResponse.json(
      { error: "No consent on file for this version." },
      { status: 404 }
    );
  }

  const doc = buildConsentPdfDocument({
    playerName: player.name,
    signerPrintedName: consent.signer_printed_name,
    signerRelationship: consent.signer_relationship as
      | "self"
      | "parent_guardian"
      | "other",
    signerRelationshipOther: consent.signer_relationship_other,
    signedAtISO: consent.signed_at,
  });

  const buffer = await renderToBuffer(doc);
  const safe = sanitizeFilename(player.name);
  const filename = `ANSA-${safe}-consent-${CONSENT_VERSION}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
