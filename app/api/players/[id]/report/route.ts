import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/dashboard";
import { canAccessPlayerReport } from "@/lib/player-report-access";
import { buildPlayerReportDocument } from "@/lib/player-report-pdf";
import { buildReportPayload } from "@/lib/build-player-report-payload";

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

  if (profile.role === "player") {
    return NextResponse.json(
      { error: "Reports are available to staff and parents only." },
      { status: 403 }
    );
  }

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select(
      `
      id, name, age, gender, school, position, status, payment_status, join_date, parent_id,
      player_groups(name)
    `
    )
    .eq("id", playerId)
    .maybeSingle();

  if (playerError || !player) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canAccessPlayerReport(profile, { parent_id: player.parent_id })) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const groupName =
    (player.player_groups as { name?: string } | null)?.name ?? null;

  const { data: latestEval } = await supabase
    .from("player_evaluations")
    .select(
      `
      id,
      evaluated_at,
      experience_summary,
      comments_recommendations,
      jersey_number,
      grade,
      height_cm,
      weight_kg,
      date_of_birth,
      overall_strengths,
      coach_user_id
    `
    )
    .eq("player_id", playerId)
    .order("evaluated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let scores: Record<string, number> = {};
  let coachName: string | null = null;

  if (latestEval) {
    const { data: scoreRows } = await supabase
      .from("player_evaluation_scores")
      .select("metric_key, value")
      .eq("evaluation_id", latestEval.id);

    scores = Object.fromEntries(
      (scoreRows ?? []).map((r) => [r.metric_key, Number(r.value)])
    );

    if (latestEval.coach_user_id) {
      const { data: coachRow } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", latestEval.coach_user_id)
        .maybeSingle();
      coachName = coachRow?.full_name ?? null;
    }
  }

  const { data: attendanceRaw } = await supabase
    .from("attendance")
    .select("session_date, present")
    .eq("player_id", playerId)
    .order("session_date", { ascending: false })
    .limit(24);

  const latestEvaluation = latestEval
    ? {
        evaluated_at: latestEval.evaluated_at,
        experience_summary: latestEval.experience_summary,
        comments_recommendations: latestEval.comments_recommendations,
        jersey_number: latestEval.jersey_number,
        grade: latestEval.grade,
        height_cm: latestEval.height_cm,
        weight_kg: latestEval.weight_kg,
        date_of_birth: latestEval.date_of_birth,
        overall_strengths: latestEval.overall_strengths ?? [],
        scores,
        coachName,
      }
    : null;

  const payload = buildReportPayload({
    player: {
      name: player.name,
      age: player.age,
      gender: player.gender,
      school: player.school,
      position: player.position,
      status: player.status,
      payment_status: player.payment_status,
      join_date: player.join_date,
    },
    groupName,
    latestEvaluation,
    attendance: (attendanceRaw ?? []).map((a) => ({
      session_date: a.session_date,
      present: a.present,
    })),
  });

  const doc = buildPlayerReportDocument(payload);
  const buffer = await renderToBuffer(doc);

  const safe = sanitizeFilename(player.name);
  const filename = `ANSA-${safe}-evaluation-report.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
