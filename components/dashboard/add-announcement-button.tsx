"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddAnnouncementButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("announcements").insert({
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().split("T")[0],
    });
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    setTitle("");
    setContent("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button className="bg-[#0066CC] hover:bg-blue-700" onClick={() => setOpen(true)}>
        Add Announcement
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow">
      <h3 className="text-lg font-semibold text-[#001F3F]">New Announcement</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="bg-[#0066CC] hover:bg-blue-700">
            {loading ? "Posting..." : "Post"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
