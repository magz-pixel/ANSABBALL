"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function DeleteEventButton({
  eventId,
  title,
}: {
  eventId: string;
  title: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm(`Remove event "${title}"? This cannot be undone.`)) return;
    setLoading(true);
    const { error } = await supabase.from("marketing_events").delete().eq("id", eventId);
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
      className="border-red-200 text-red-700 hover:bg-red-50"
      disabled={loading}
      onClick={handleDelete}
    >
      {loading ? "Removing…" : "Remove"}
    </Button>
  );
}
