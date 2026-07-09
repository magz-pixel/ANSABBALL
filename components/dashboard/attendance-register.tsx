"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Group {
  id: string;
  name: string;
}

interface AttendanceRegisterProps {
  groups: Group[];
}

type PlayerRow = { id: string; name: string };
type AttendanceRow = {
  session_date: string;
  player_id: string;
  present: boolean;
};

export function AttendanceRegister({ groups }: AttendanceRegisterProps) {
  const supabase = createClient();
  const [groupId, setGroupId] = useState("");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [records, setRecords] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!groupId) {
      setPlayers([]);
      setSessions([]);
      setRecords([]);
      return;
    }

    async function load() {
      setLoading(true);
      const { data: playerData } = await supabase
        .from("players")
        .select("id, name")
        .eq("group_id", groupId)
        .order("name");

      const playerIds = (playerData ?? []).map((p) => p.id);
      setPlayers(playerData ?? []);

      if (playerIds.length === 0) {
        setSessions([]);
        setRecords([]);
        setLoading(false);
        return;
      }

      const { data: att } = await supabase
        .from("attendance")
        .select("session_date, player_id, present")
        .in("player_id", playerIds)
        .gte("session_date", fromDate)
        .lte("session_date", toDate)
        .order("session_date", { ascending: true });

      const rows = att ?? [];
      setRecords(rows);
      setSessions([...new Set(rows.map((r) => r.session_date))].sort());
      setLoading(false);
    }

    load();
  }, [groupId, fromDate, toDate, supabase]);

  const presentMap = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const r of records) {
      m.set(`${r.session_date}:${r.player_id}`, r.present);
    }
    return m;
  }, [records]);

  function exportCsv() {
    if (!players.length || !sessions.length) return;
    const header = ["Player", ...sessions.map((s) => s)].join(",");
    const lines = players.map((p) => {
      const cells = sessions.map((date) => {
        const val = presentMap.get(`${date}:${p.id}`);
        if (val === undefined) return "";
        return val ? "Present" : "Absent";
      });
      return [`"${p.name.replace(/"/g, '""')}"`, ...cells].join(",");
    });
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-register-${fromDate}-to-${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (groups.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance register</CardTitle>
        <p className="text-sm text-black/70">
          Full roster view for a group across a date range. Coaches use the session form above; this
          summary is for admins reviewing attendance history.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <div>
            <Label>Group</Label>
            <select
              className="mt-1 block w-full min-w-[12rem] rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">Select group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-black/60">Loading register…</p>
        ) : !groupId ? (
          <p className="text-black/60">Select a group to view the full register.</p>
        ) : players.length === 0 ? (
          <p className="text-black/60">No players in this group.</p>
        ) : sessions.length === 0 ? (
          <p className="text-black/60">No attendance recorded in this date range.</p>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
                Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-semibold text-[#001F3F]">
                      Player
                    </th>
                    {sessions.map((date) => (
                      <th key={date} className="px-3 py-3 text-center font-medium text-[#001F3F]">
                        {date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="sticky left-0 bg-white px-4 py-2 font-medium">{p.name}</td>
                      {sessions.map((date) => {
                        const val = presentMap.get(`${date}:${p.id}`);
                        return (
                          <td key={date} className="px-3 py-2 text-center">
                            {val === undefined ? (
                              <span className="text-black/30">—</span>
                            ) : val ? (
                              <span className="text-green-700">✓</span>
                            ) : (
                              <span className="text-red-600">✗</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
