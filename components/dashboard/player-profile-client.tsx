"use client";

import { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLAYER_SKILLS } from "@/lib/player-skills";
import { DownloadPlayerReportButton } from "@/components/dashboard/download-player-report-button";

const SKILLS = [...PLAYER_SKILLS];

interface Log {
  id: string;
  date: string;
  skill: string;
  value: number;
  coach_notes: string | null;
}

export function PlayerProfileClient({
  playerId,
  playerName,
  initialLogs,
  canEdit = false,
}: {
  playerId: string;
  playerName: string;
  initialLogs: Log[];
  canEdit?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [logs, setLogs] = useState(initialLogs);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(
    Object.fromEntries(SKILLS.map((s) => [s, 5])) as Record<string, number>
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const latestBySkill = SKILLS.map((skill) => {
    const log = [...logs].reverse().find((l) => l.skill === skill);
    return { skill, value: log?.value ?? 0, fullMark: 10 };
  });

  const chartData = SKILLS.map((skill) => {
    const log = logs.find((l) => l.skill === skill);
    return { skill, value: log?.value ?? 0 };
  });

  const timeSeriesData = SKILLS.flatMap((skill) =>
    logs
      .filter((l) => l.skill === skill)
      .map((l) => ({ date: l.date, [skill]: l.value, skill }))
  ).sort((a, b) => a.date.localeCompare(b.date));

  const uniqueDates = [...new Set(timeSeriesData.map((d) => d.date))].slice(-10);
  const lineData = uniqueDates.map((date) => {
    const point: Record<string, string | number> = { date };
    SKILLS.forEach((s) => {
      const log = logs.find((l) => l.date === date && l.skill === s);
      point[s] = log?.value ?? 0;
    });
    return point;
  });

  async function handleAddLog(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    for (const skill of SKILLS) {
      const value = form[skill];
      if (value != null && value >= 0 && value <= 10) {
        await supabase.from("progress_logs").insert({
          player_id: playerId,
          skill,
          value,
          coach_notes: notes.trim() || null,
        });
      }
    }
    setLoading(false);
    setForm(Object.fromEntries(SKILLS.map((s) => [s, 5])) as Record<string, number>);
    setNotes("");
    setShowForm(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {canEdit && (
        <Card className="border-[#0066CC]/30 bg-[#0066CC]/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">📋 Log Session / Add Progress</CardTitle>
            <Button
              size="sm"
              className="bg-[#0066CC] hover:bg-blue-700"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "Add Log"}
            </Button>
          </CardHeader>
          {showForm && (
            <CardContent>
              <form onSubmit={handleAddLog} className="space-y-4">
                <p className="text-sm text-black/70">Rate each skill 0–10. Add coach notes for drills worked on.</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {SKILLS.map((skill) => (
                    <div key={skill}>
                      <Label>{skill.replace("_", " ")}</Label>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        value={form[skill] ?? 5}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [skill]: parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <Label>Coach Notes (drills, focus areas)</Label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0066CC] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Worked on crossover dribble, free throws. Good form today."
                  />
                </div>
                <Button type="submit" disabled={loading} className="bg-[#0066CC] hover:bg-blue-700">
                  {loading ? "Saving..." : "Save Progress Log"}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Skill Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={latestBySkill}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar
                    name={playerName}
                    dataKey="value"
                    stroke="#0066CC"
                    fill="#0066CC"
                    fillOpacity={0.4}
                  />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                {SKILLS.map((s, i) => (
                  <Line
                    key={s}
                    type="monotone"
                    dataKey={s}
                    stroke={
                      ["#0066CC", "#001F3F", "#22c55e", "#eab308", "#ef4444", "#8b5cf6"][i]
                    }
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PDF report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-black/70">
            Download a printable summary with profile, latest skill ratings, progress log, and
            recent attendance — for staff records or sharing with families.
          </p>
          <DownloadPlayerReportButton
            playerId={playerId}
            playerName={playerName}
            className="mt-4"
          />
        </CardContent>
      </Card>
    </div>
  );
}
