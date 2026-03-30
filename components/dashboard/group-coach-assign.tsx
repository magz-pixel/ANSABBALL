"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

type GroupRow = { id: string; name: string; coach_id: string | null };
type CoachOption = { id: string; label: string };

export function GroupCoachAssign({
  groups,
  coaches,
}: {
  groups: GroupRow[];
  coaches: CoachOption[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function assign(groupId: string, coachId: string | null) {
    setSavingId(groupId);
    setError(null);
    const { error: err } = await supabase
      .from("player_groups")
      .update({ coach_id: coachId })
      .eq("id", groupId);
    setSavingId(null);
    if (err) {
      setError(err.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {groups.map((g) => (
          <div
            key={g.id}
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-[#001F3F]">{g.name}</p>
              <p className="text-xs text-black/50">Assign which coach runs this group</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor={`coach-${g.id}`} className="sr-only">
                Coach for {g.name}
              </Label>
              <select
                id={`coach-${g.id}`}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0066CC] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
                value={g.coach_id ?? ""}
                disabled={savingId === g.id}
                onChange={(e) => {
                  const v = e.target.value;
                  assign(g.id, v === "" ? null : v);
                }}
              >
                <option value="">No coach assigned</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              {savingId === g.id && (
                <span className="text-xs text-black/50">Saving…</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
