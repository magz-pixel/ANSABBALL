"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlayerProfileFormProps {
  userId: string;
  defaultName: string;
  onComplete: () => void;
}

export function PlayerProfileForm({ userId, defaultName, onComplete }: PlayerProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: defaultName || "",
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    position: "",
    school: "",
    enrollment_type: "independent" as "school" | "independent",
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    photo_url: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    let parentId: string | null = null;
    if (form.parent_email.trim()) {
      const { data: parent } = await supabase
        .from("users")
        .select("id")
        .eq("email", form.parent_email.trim().toLowerCase())
        .single();
      parentId = parent?.id ?? null;
    }

    const insertData: Record<string, unknown> = {
      name: form.name.trim(),
      age: form.age ? parseInt(form.age, 10) : null,
      gender: form.gender.trim() || null,
      position: form.position.trim() || null,
      school: form.enrollment_type === "school" ? form.school.trim() || null : null,
      player_user_id: userId,
      parent_id: parentId,
      status: "pending",
      payment_status: "pending",
    };
    if (form.parent_name.trim()) insertData.parent_name = form.parent_name.trim();
    if (form.parent_phone.trim()) insertData.parent_phone = form.parent_phone.trim();
    if (form.photo_url.trim()) insertData.photo_url = form.photo_url.trim();
    const { error } = await supabase.from("players").insert(insertData);

    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    setDone(true);
    onComplete();
  }

  if (done) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-6 text-center text-green-800">
          <p className="font-medium">Profile saved!</p>
          <p className="mt-1 text-sm">Your details are ready. Once approved, you&apos;ll appear on the player list.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Player Profile</CardTitle>
        <CardDescription>
          Help Coach Brian know you better. This info will appear on your player card once approved.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="photo_url">Profile Photo URL (optional)</Label>
            <Input
              id="photo_url"
              type="url"
              value={form.photo_url}
              onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))}
              placeholder="https://... (headshot image link)"
            />
            <p className="mt-1 text-xs text-black/60">Paste a link to your photo. Leave blank for a placeholder.</p>
          </div>
          <div>
            <Label htmlFor="name">Full Name *</Label>
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
                max={25}
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input
                id="height_cm"
                type="number"
                min={100}
                max={220}
                placeholder="e.g. 175"
                value={form.height_cm}
                onChange={(e) => setForm((f) => ({ ...f, height_cm: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                min={25}
                max={120}
                step={0.1}
                placeholder="e.g. 65"
                value={form.weight_kg}
                onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <select
              id="position"
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              <option value="Point Guard">Point Guard</option>
              <option value="Shooting Guard">Shooting Guard</option>
              <option value="Small Forward">Small Forward</option>
              <option value="Power Forward">Power Forward</option>
              <option value="Center">Center</option>
            </select>
          </div>
          <div>
            <Label>Enrollment</Label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="enrollment"
                  checked={form.enrollment_type === "independent"}
                  onChange={() => setForm((f) => ({ ...f, enrollment_type: "independent" }))}
                  className="h-4 w-4"
                />
                <span className="text-sm">Independent</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="enrollment"
                  checked={form.enrollment_type === "school"}
                  onChange={() => setForm((f) => ({ ...f, enrollment_type: "school" }))}
                  className="h-4 w-4"
                />
                <span className="text-sm">School</span>
              </label>
            </div>
          </div>
          {form.enrollment_type === "school" && (
            <div>
              <Label htmlFor="school">School Name</Label>
              <Input
                id="school"
                value={form.school}
                onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
                placeholder="e.g. St. Mary's Academy"
              />
            </div>
          )}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="mb-3 text-sm font-medium text-[#001F3F]">Parent / Guardian Details</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="parent_name">Parent Name</Label>
                <Input
                  id="parent_name"
                  value={form.parent_name}
                  onChange={(e) => setForm((f) => ({ ...f, parent_name: e.target.value }))}
                  placeholder="e.g. Jane Omondi"
                />
              </div>
              <div>
                <Label htmlFor="parent_email">Parent Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={form.parent_email}
                  onChange={(e) => setForm((f) => ({ ...f, parent_email: e.target.value }))}
                  placeholder="Link to parent account (if they have one)"
                />
                <p className="mt-1 text-xs text-black/60">
                  If your parent has an ANSA account, enter their email to link your profile.
                </p>
              </div>
              <div>
                <Label htmlFor="parent_phone">Parent Phone</Label>
                <Input
                  id="parent_phone"
                  type="tel"
                  value={form.parent_phone}
                  onChange={(e) => setForm((f) => ({ ...f, parent_phone: e.target.value }))}
                  placeholder="e.g. 0718082452"
                />
              </div>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="bg-[#0066CC] hover:bg-blue-700">
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
