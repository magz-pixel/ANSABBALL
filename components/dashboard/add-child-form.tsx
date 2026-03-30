"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Expertise =
  | "beginner"
  | "developing"
  | "intermediate"
  | "advanced"
  | "elite";

export function AddChildForm() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoPreview = useMemo(() => {
    if (!photoFile) return null;
    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  useEffect(() => {
    if (!photoPreview) return;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    school: "",
    expertise_level: "beginner" as Expertise,
  });

  async function uploadChildPhoto(file: File): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const ext = file.name.split(".").pop()?.toLowerCase();
    const safeExt =
      ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp"
        ? ext
        : "jpg";
    const path = `${user.id}/${Date.now()}-child.${safeExt}`;
    const { error } = await supabase.storage.from("player-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || `image/${safeExt === "jpg" ? "jpeg" : safeExt}`,
    });
    if (error) {
      console.error("child photo upload error", error);
      alert(
        `Unable to upload photo: ${error.message}\n\nIf this keeps happening, run Supabase migration 20260322000000_player_photos_storage.sql to create the bucket and upload policy.`
      );
      return null;
    }
    const { data } = supabase.storage.from("player-photos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    if (!photoFile) {
      alert("Please upload a passport-style photo.");
      setLoading(false);
      return;
    }
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

    const photoUrl = await uploadChildPhoto(photoFile);
    if (!photoUrl) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("players").insert({
      name: form.name.trim(),
      age: form.age ? parseInt(form.age, 10) : null,
      gender: form.gender.trim() || null,
      school: form.school.trim() || null,
      expertise_level: form.expertise_level,
      parent_id: user.id,
      player_user_id: null,
      status: "pending",
      payment_status: "pending",
      photo_url: photoUrl,
    });

    setLoading(false);
    if (error) {
      alert(
        `Could not save child profile: ${error.message}\n\nIf this says \"row-level security\", run migration 20260330000001_player_expertise_and_parent_child_insert.sql to allow parent inserts.`
      );
      return;
    }

    router.push("/dashboard/children");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register a child</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="child-photo">Passport-style photo *</Label>
            <Input
              id="child-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
            {photoPreview ? (
              <div className="mt-3 relative h-24 w-24 overflow-hidden rounded-lg border bg-white">
                <Image
                  src={photoPreview}
                  alt="Child photo preview"
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              </div>
            ) : null}
          </div>

          <div>
            <Label htmlFor="name">Child full name *</Label>
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

          <div>
            <Label htmlFor="expertise_level">Expertise level</Label>
            <select
              id="expertise_level"
              value={form.expertise_level}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  expertise_level: e.target.value as Expertise,
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
            <Label htmlFor="school">School (optional)</Label>
            <Input
              id="school"
              value={form.school}
              onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="bg-[#0066CC] hover:bg-blue-700">
              {loading ? "Saving..." : "Save child"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/children")}>
              Cancel
            </Button>
          </div>

          <p className="text-xs text-black/60">
            For multiple children, return to “My Children” and tap “Add another child”.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

