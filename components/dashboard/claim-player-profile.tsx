"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Claimable = {
  id: string;
  name: string;
  age: number | null;
  school: string | null;
  expertise_level: string | null;
};

export function ClaimPlayerProfile({
  defaultParentEmail = "",
}: {
  defaultParentEmail?: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [parentEmail, setParentEmail] = useState(defaultParentEmail);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [rows, setRows] = useState<Claimable[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setParentEmail(defaultParentEmail);
  }, [defaultParentEmail]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setRows([]);

    const email = parentEmail.trim().toLowerCase();
    if (!email) {
      setError("Enter your parent/guardian email.");
      return;
    }

    setLoading(true);
    const { data, error: rpcErr } = await supabase.rpc(
      "get_claimable_players_by_parent_email",
      { p_parent_email: email }
    );
    setLoading(false);

    if (rpcErr) {
      setError(
        `Could not search profiles: ${rpcErr.message}\n\nIf this is a new Supabase project, run migration 20260330000002_claim_player_profile_rpc.sql and reload schema cache.`
      );
      return;
    }

    setRows((data ?? []) as Claimable[]);
    if (!data || data.length === 0) {
      setError(
        "No claimable child profiles found for that email. Ask your parent to add you under “My Children”, or check the email spelling."
      );
    }
  }

  async function handleClaim(playerId: string) {
    setError(null);
    setSuccess(null);
    setClaimingId(playerId);
    const email = parentEmail.trim().toLowerCase();

    const { error: rpcErr } = await supabase.rpc("claim_player_profile", {
      p_player_id: playerId,
      p_parent_email: email,
    });

    setClaimingId(null);

    if (rpcErr) {
      setError(`Could not claim profile: ${rpcErr.message}`);
      return;
    }

    setSuccess(
      "Profile linked successfully. Please refresh the page (or sign out and sign back in)."
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link your player profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-black/70">
          If your parent already added you under “My Children”, you can link that profile to your
          login here (no manual Supabase pairing needed).
        </p>

        <form onSubmit={handleSearch} className="space-y-3">
          <div>
            <Label htmlFor="parentEmail">Parent/guardian email</Label>
            <Input
              id="parentEmail"
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="parent@email.com"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="bg-[#0066CC] hover:bg-blue-700">
            {loading ? "Searching..." : "Find my profile"}
          </Button>
        </form>

        {error ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
        ) : null}
        {success ? (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{success}</div>
        ) : null}

        {rows.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#001F3F]">Select your profile:</p>
            <ul className="space-y-2">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#001F3F]">{r.name}</p>
                    <p className="text-xs text-black/60">
                      Age {r.age ?? "—"}
                      {r.school ? ` • ${r.school}` : ""}
                      {r.expertise_level ? ` • ${r.expertise_level}` : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleClaim(r.id)}
                    disabled={claimingId === r.id}
                    className="bg-[#0066CC] hover:bg-blue-700"
                  >
                    {claimingId === r.id ? "Linking..." : "Link this profile"}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

