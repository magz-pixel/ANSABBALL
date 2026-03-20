"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Group {
  id: string;
  name: string;
}

export function AttendanceClient({ groups }: { groups: Group[] }) {
  const supabase = createClient();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [players, setPlayers] = useState<{ id: string; name: string; present?: boolean }[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!selectedGroupId) {
      const id = requestAnimationFrame(() => setPlayers([]));
      return () => cancelAnimationFrame(id);
    }
    async function load() {
      const { data } = await supabase
        .from("players")
        .select("id, name")
        .eq("group_id", selectedGroupId)
        .eq("status", "active")
        .order("name");
      const { data: att } = await supabase
        .from("attendance")
        .select("player_id, present, notes")
        .eq("session_date", selectedDate);
      const attMap = new Map(att?.map((a) => [a.player_id, { present: a.present, notes: a.notes }]) ?? []);
      setPlayers(
        (data ?? []).map((p) => {
          const a = attMap.get(p.id);
          return {
            id: p.id,
            name: p.name,
            present: a?.present ?? true,
          };
        })
      );
      setNotes(
        Object.fromEntries(
          (att ?? []).map((a) => [a.player_id, a.notes ?? ""])
        )
      );
    }
    load();
  }, [selectedGroupId, selectedDate, supabase]);

  async function handleSave() {
    setLoading(true);
    for (const p of players) {
      await supabase.from("attendance").upsert(
        {
          session_date: selectedDate,
          player_id: p.id,
          present: p.present ?? true,
          notes: notes[p.id] ?? null,
        },
        { onConflict: "session_date,player_id" }
      );
    }
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Attendance</CardTitle>
        <div className="flex flex-wrap gap-4 pt-4">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Group</Label>
            <select
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0066CC] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="">Select group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <p className="text-black/60">
            Select a group and date to load players.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-100 p-3"
                >
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={p.present ?? true}
                      onChange={(e) =>
                        setPlayers((prev) =>
                          prev.map((x) =>
                            x.id === p.id ? { ...x, present: e.target.checked } : x
                          )
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]"
                    />
                    <span className="font-medium">{p.name}</span>
                  </label>
                  <Input
                    placeholder="Notes"
                    value={notes[p.id] ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                    className="max-w-xs"
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="mt-6 bg-[#0066CC] hover:bg-blue-700"
            >
              {loading ? "Saving..." : saved ? "Saved!" : "Save Attendance"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
