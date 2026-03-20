import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/dashboard";
import { canAccessPlayerReport } from "@/lib/player-report-access";
import { buildPlayerReportDocument } from "@/lib/player-report-pdf";
import { PLAYER_SKILLS } from "@/lib/player-skills";
import type { PlayerReportPayload } from "@/lib/player-report-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "player";
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

  const [{ data: progressRaw }, { data: attendanceRaw }] = await Promise.all([
    supabase
      .from("progress_logs")
      .select("date, skill, value, coach_notes")
      .eq("player_id", playerId)
      .order("date", { ascending: false })
      .limit(120),
    supabase
      .from("attendance")
      .select("session_date, present")
      .eq("player_id", playerId)
      .order("session_date", { ascending: false })
      .limit(24),
  ]);

  const progressLogs = progressRaw ?? [];
  const groupName =
    (player.player_groups as { name?: string } | null)?.name ?? null;

  const latestBySkill = PLAYER_SKILLS.map((skill) => {
    const forSkill = progressLogs.filter((l) => l.skill === skill);
    const sorted = [...forSkill].sort((a, b) => b.date.localeCompare(a.date));
    const top = sorted[0];
    return { skill, value: top?.value ?? 0 };
  });

  const progressForPdf = [...progressLogs]
    .sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      if (d !== 0) return d;
      return a.skill.localeCompare(b.skill);
    })
    .slice(0, 42);

  const generatedAtLabel = new Date().toLocaleString("en-KE", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const payload: PlayerReportPayload = {
    player: {
      name: player.name,
      age: player.age,
      gender: player.gender,
      school: player.school,
      position: player.position,
      status: player.status,
      payment_status: player.payment_status,
      join_date: player.join_date,
      groupName,
    },
    generatedAtLabel,
    skills: latestBySkill,
    progressLogs: progressForPdf.map((l) => ({
      date: l.date,
      skill: l.skill,
      value: l.value,
      coach_notes: l.coach_notes,
    })),
    attendance: (attendanceRaw ?? []).map((a) => ({
      session_date: a.session_date,
      present: a.present,
    })),
  };

  const doc = buildPlayerReportDocument(payload);
  const buffer = await renderToBuffer(doc);

  const safe = sanitizeFilename(player.name);
  const filename = `ANSA-${safe}-report.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
