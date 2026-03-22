"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PlayerProfileFormProps {
  userId: string;
  defaultName: string;
  onComplete: () => void;
}

export function PlayerProfileForm({ userId, defaultName, onComplete }: PlayerProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoPreview = useMemo(() => {
    if (!photoFile) return null;
    return URL.createObjectURL(photoFile);
  }, [photoFile]);
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

  useEffect(() => {
    if (!photoPreview) return;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  async function uploadPlayerPhoto(file: File): Promise<string | null> {
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase();
    const safeExt =
      ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp" ? ext : "jpg";
    const path = `${userId}/${Date.now()}-passport.${safeExt}`;
    const { error } = await supabase.storage.from("player-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || `image/${safeExt === "jpg" ? "jpeg" : safeExt}`,
    });
    if (error) {
      console.error(error);
      return null;
    }
    const { data } = supabase.storage.from("player-photos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    let resolvedPhotoUrl = form.photo_url.trim();
    if (photoFile) {
      if (photoFile.size > PHOTO_MAX_BYTES) {
        alert("Photo must be 5 MB or smaller.");
        setLoading(false);
        return;
      }
      if (!ACCEPT_TYPES.includes(photoFile.type)) {
        alert("Please use a JPEG, PNG, or WebP image.");
        setLoading(false);
        return;
      }
      const uploaded = await uploadPlayerPhoto(photoFile);
      if (!uploaded) {
        alert("Could not upload photo. Check your connection and try again.");
        setLoading(false);
        return;
      }
      resolvedPhotoUrl = uploaded;
    }

    if (!resolvedPhotoUrl) {
      alert(
        "Please upload a passport-style photo (or paste an image URL in the optional field below)."
      );
      setLoading(false);
      return;
    }

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
      photo_url: resolvedPhotoUrl,
    };
    if (form.height_cm.trim()) {
      insertData.height_cm = parseInt(form.height_cm, 10);
    }
    if (form.weight_kg.trim()) {
      insertData.weight_kg = parseFloat(form.weight_kg);
    }
    if (form.parent_name.trim()) insertData.parent_name = form.parent_name.trim();
    if (form.parent_phone.trim()) insertData.parent_phone = form.parent_phone.trim();

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
        <p className="mt-3 text-sm text-black/70">
          <strong>We collect:</strong> passport-style photo, full name, age, gender, height/weight,
          position, school or independent enrollment, and parent/guardian contact details (name, email,
          phone) so we can link a parent account if they already use ANSA.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-[#0066CC]/20 bg-[#0066CC]/5 p-4">
            <Label htmlFor="player-photo" className="text-base font-semibold text-[#001F3F]">
              Passport-style photo *
            </Label>
            <p className="mt-1 text-sm text-black/75">
              Upload a <strong>clear, recent</strong> photo of your face — like a passport or school ID
              (head and shoulders, good lighting, plain background if possible). Max 5 MB. JPEG, PNG,
              or WebP.
            </p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex flex-col gap-2">
                <Input
                  id="player-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full max-w-sm cursor-pointer text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#0066CC] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setPhotoFile(f);
                    if (f) setForm((prev) => ({ ...prev, photo_url: "" }));
                  }}
                />
                <p className="text-xs text-black/55">
                  Prefer upload. If you can&apos;t upload right now, use the optional URL field below
                  instead.
                </p>
              </div>
              {photoPreview ? (
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <Image
                    src={photoPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="112px"
                    unoptimized
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <Label htmlFor="photo_url">Image URL (optional alternative)</Label>
            <Input
              id="photo_url"
              type="url"
              value={form.photo_url}
              onChange={(e) => {
                const v = e.target.value;
                setForm((f) => ({ ...f, photo_url: v }));
                if (v.trim()) setPhotoFile(null);
              }}
              placeholder="https://... only if you are not uploading a file above"
              disabled={!!photoFile}
            />
            <p className="mt-1 text-xs text-black/60">
              Use this only if you already have your photo hosted online. Leave blank when uploading a
              file.
            </p>
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
