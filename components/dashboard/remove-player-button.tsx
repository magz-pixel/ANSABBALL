"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function RemovePlayerButton({
  playerId,
  playerName,
}: {
  playerId: string;
  playerName: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (
      !confirm(
        `Remove "${playerName}"? This deletes the player profile and any linked records (attendance, evaluations, etc.).`
      )
    ) {
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("players").delete().eq("id", playerId);
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0 border-red-200 text-red-700 hover:bg-red-50"
      disabled={loading}
      onClick={handleRemove}
    >
      {loading ? "Removing…" : "Remove"}
    </Button>
  );
}

