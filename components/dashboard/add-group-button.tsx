"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddGroupButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("player_groups").insert({ name: name.trim() });
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    setName("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button className="bg-[#0066CC] hover:bg-blue-700" onClick={() => setOpen(true)}>
        Add Group
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow">
      <h3 className="text-lg font-semibold text-[#001F3F]">New Group</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="name">Group Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Juniors (8-12)"
            required
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="bg-[#0066CC] hover:bg-blue-700">
            {loading ? "Adding..." : "Add"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
