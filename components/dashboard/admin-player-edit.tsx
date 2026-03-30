"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Group = { id: string; name: string };

export function AdminPlayerEdit({
  playerId,
  groups,
  initial,
}: {
  playerId: string;
  groups: Group[];
  initial: {
    group_id: string | null;
    status: "pending" | "active" | "inactive";
    payment_status: "pending" | "paid";
    parent_email: string | null;
    player_login_email: string | null;
  };
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [groupId, setGroupId] = useState(initial.group_id ?? "");
  const [status, setStatus] = useState(initial.status);
  const [paymentStatus, setPaymentStatus] = useState(initial.payment_status);
  const [parentEmail, setParentEmail] = useState(initial.parent_email ?? "");
  const [playerLoginEmail, setPlayerLoginEmail] = useState(
    initial.player_login_email ?? ""
  );

  async function resolveUserIdByEmail(email: string): Promise<string | null> {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return null;
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", trimmed)
      .single();
    if (error) return null;
    return data?.id ?? null;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setSaving(true);

    const parentId = parentEmail.trim()
      ? await resolveUserIdByEmail(parentEmail)
      : null;
    if (parentEmail.trim() && !parentId) {
      setSaving(false);
      setError("Parent email not found in the system.");
      return;
    }

    const playerUserId = playerLoginEmail.trim()
      ? await resolveUserIdByEmail(playerLoginEmail)
      : null;
    if (playerLoginEmail.trim() && !playerUserId) {
      setSaving(false);
      setError("Player login email not found in the system.");
      return;
    }

    const { error } = await supabase
      .from("players")
      .update({
        group_id: groupId || null,
        status,
        payment_status: paymentStatus,
        parent_id: parentId,
        player_user_id: playerUserId,
      })
      .eq("id", playerId);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }

    setOk("Saved.");
    router.refresh();
  }

  return (
    <Card className="border-[#001F3F]/10">
      <CardHeader>
        <CardTitle className="text-base">Admin controls</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          {error ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}
          {ok ? (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
              {ok}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="group_id">Group</Label>
              <select
                id="group_id"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as typeof initial.status)
                }
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="pending">pending</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="payment_status">Payment</Label>
              <select
                id="payment_status"
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value as typeof initial.payment_status)
                }
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="pending">pending</option>
                <option value="paid">paid</option>
              </select>
            </div>
            <div />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="parent_email">Link to parent email (optional)</Label>
              <Input
                id="parent_email"
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@email.com"
              />
              <p className="mt-1 text-xs text-black/60">
                Sets <code>players.parent_id</code> to the matching user.
              </p>
            </div>
            <div>
              <Label htmlFor="player_login_email">
                Link to player login email (optional)
              </Label>
              <Input
                id="player_login_email"
                type="email"
                value={playerLoginEmail}
                onChange={(e) => setPlayerLoginEmail(e.target.value)}
                placeholder="player@email.com"
              />
              <p className="mt-1 text-xs text-black/60">
                Sets <code>players.player_user_id</code> so the player can log in
                and see this profile.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#0066CC] hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => router.refresh()}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

