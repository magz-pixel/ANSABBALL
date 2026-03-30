"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Group {
  id: string;
  name: string;
}

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  groups?: Group[];
}

export function AddPlayerModal({ open, onClose, groups = [] }: AddPlayerModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    school: "",
    expertise_level: "beginner" as
      | "beginner"
      | "developing"
      | "intermediate"
      | "advanced"
      | "elite",
    parent_email: "",
    group_id: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let parentId = null;
    if (form.parent_email) {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", form.parent_email.trim())
        .single();
      parentId = existing?.id ?? null;
    }

    const { error } = await supabase.from("players").insert({
      name: form.name.trim(),
      age: form.age ? parseInt(form.age, 10) : null,
      gender: form.gender.trim() || null,
      school: form.school.trim() || null,
      expertise_level: form.expertise_level,
      parent_id: parentId,
      group_id: form.group_id || null,
      status: "pending",
      payment_status: "pending",
    });

    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    setForm({
      name: "",
      age: "",
      gender: "",
      school: "",
      expertise_level: "beginner",
      parent_email: "",
      group_id: "",
    });
    onClose();
    router.refresh();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[#001F3F]">Add Player</h2>
        <p className="mt-1 text-sm text-black/70">
          Create a new player profile. Parent will be linked if email exists.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={5}
                max={18}
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                placeholder="M/F"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="expertise_level">Expertise level</Label>
            <select
              id="expertise_level"
              value={form.expertise_level}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  expertise_level: e.target.value as typeof f.expertise_level,
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="beginner">Beginner</option>
              <option value="developing">Developing</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="elite">Elite</option>
            </select>
          </div>
          <div>
            <Label htmlFor="school">School</Label>
            <Input
              id="school"
              value={form.school}
              onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
            />
          </div>
          {groups.length > 0 && (
            <div>
              <Label htmlFor="group_id">Group</Label>
              <select
                id="group_id"
                value={form.group_id}
                onChange={(e) => setForm((f) => ({ ...f, group_id: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <Label htmlFor="parent_email">Parent Email</Label>
            <Input
              id="parent_email"
              type="email"
              value={form.parent_email}
              onChange={(e) => setForm((f) => ({ ...f, parent_email: e.target.value }))}
              placeholder="Link to existing parent account"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="bg-[#0066CC] hover:bg-blue-700">
              {loading ? "Adding..." : "Add Player"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
