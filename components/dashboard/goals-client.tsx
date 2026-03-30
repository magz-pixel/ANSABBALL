"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  completed: boolean;
}

export function GoalsClient({
  playerId,
  initialGoals,
}: {
  playerId: string | null;
  initialGoals: Goal[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [goals, setGoals] = useState(initialGoals);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!playerId) return;
    setLoading(true);
    await supabase.from("goals").insert({
      player_id: playerId,
      title: title.trim(),
      target: parseFloat(target) || 0,
      current: 0,
    });
    setTitle("");
    setTarget("");
    setLoading(false);
    router.refresh();
  }

  async function handleUpdateProgress(goalId: string, newCurrent: number) {
    await supabase.from("goals").update({ current: newCurrent }).eq("id", goalId);
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, current: newCurrent } : g))
    );
    router.refresh();
  }

  if (!playerId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-black/60">
          No player profile linked. Contact the ANSA Admin.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label>Goal (e.g., 100 free throws/day)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your challenge?"
                required
              />
            </div>
            <div>
              <Label>Target</Label>
              <Input
                type="number"
                min={1}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. 100"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-[#0066CC] hover:bg-blue-700">
              {loading ? "Adding..." : "Add Goal"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-black/60">No goals yet.</p>
          ) : (
            <ul className="space-y-4">
              {goals.map((g) => (
                <li key={g.id} className="rounded-lg border border-gray-200 p-4">
                  <p className="font-medium">{g.title}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-[#0066CC] transition-all"
                      style={{
                        width: `${Math.min(100, (g.current / g.target) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-sm text-black/70">
                    {g.current} / {g.target}
                  </p>
                  {!g.completed && (
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateProgress(g.id, Math.min(g.target, g.current + 1))}
                      >
                        +1
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
