"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
type GroupRow = { id: string; name: string; coachIds: string[] };
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
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(groupId: string, coachId: string, enable: boolean) {
    const key = `${groupId}:${coachId}`;
    setSavingKey(key);
    setError(null);
    let err;
    if (enable) {
      const res = await supabase.from("player_group_coaches").insert({
        group_id: groupId,
        coach_id: coachId,
      });
      err = res.error;
    } else {
      const res = await supabase
        .from("player_group_coaches")
        .delete()
        .eq("group_id", groupId)
        .eq("coach_id", coachId);
      err = res.error;
    }
    setSavingKey(null);
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
          <div key={g.id} className="flex flex-col gap-3 px-4 py-4">
            <div>
              <p className="font-medium text-[#001F3F]">{g.name}</p>
              <p className="text-xs text-black/50">
                Select one or more coaches for this group (all selected coaches can take attendance and
                submit evaluations for these players).
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2" role="group" aria-label={`Coaches for ${g.name}`}>
              {coaches.map((c) => {
                const checked = g.coachIds.includes(c.id);
                const busy = savingKey === `${g.id}:${c.id}`;
                return (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-black/85"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]"
                      checked={checked}
                      disabled={busy}
                      onChange={(e) => toggle(g.id, c.id, e.target.checked)}
                    />
                    <span>{busy ? "Saving…" : c.label}</span>
                  </label>
                );
              })}
              {coaches.length === 0 && (
                <p className="text-sm text-black/50">Add coaches under Coaches first.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
