"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteAnnouncementButton({
  announcementId,
  title,
}: {
  announcementId: string;
  title: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (
      !confirm(
        `Delete announcement "${title.slice(0, 80)}${title.length > 80 ? "…" : ""}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("announcements").delete().eq("id", announcementId);
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
      onClick={handleDelete}
    >
      {loading ? "Deleting…" : "Delete"}
    </Button>
  );
}
