"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Entry {
  id: string;
  date: string;
  entry: string;
}

export function JournalClient({
  playerId,
  initialEntries,
}: {
  playerId: string | null;
  initialEntries: Entry[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const entries = initialEntries;
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!playerId) return;
    setLoading(true);
    await supabase.from("journal_entries").insert({
      player_id: playerId,
      date,
      entry: entry.trim(),
    });
    setEntry("");
    setLoading(false);
    router.refresh();
  }

  if (!playerId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-black/60">
          No player profile linked. Contact Coach Brian.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>What did you practice?</Label>
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0066CC] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
                rows={4}
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Dribbling drills, shooting practice, free throws..."
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-[#0066CC] hover:bg-blue-700">
              {loading ? "Saving..." : "Save Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-black/60">No entries yet.</p>
          ) : (
            <ul className="space-y-4">
              {entries.map((e) => (
                <li key={e.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <p className="text-sm font-medium text-black/70">{e.date}</p>
                  <p className="mt-1 whitespace-pre-wrap text-black/85">{e.entry}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
