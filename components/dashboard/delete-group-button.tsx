"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function DeleteGroupButton({ groupId, groupName }: { groupId: string; groupName: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Delete group "${groupName}"? Players in this group will be unassigned from the group (their profiles stay).`
      )
    ) {
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("player_groups").delete().eq("id", groupId);
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
      className="border-red-200 text-red-700 hover:bg-red-50"
      disabled={loading}
      onClick={handleDelete}
    >
      {loading ? "Deleting…" : "Delete group"}
    </Button>
  );
}
