"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function CoachProfileSetup({
  userId,
  defaultName,
  onComplete,
}: {
  userId: string;
  defaultName: string;
  onComplete?: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoPreview = useMemo(() => {
    if (!photoFile) return null;
    return URL.createObjectURL(photoFile);
  }, [photoFile]);
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (!photoPreview) return;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  async function uploadPhoto(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const safeExt =
      ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp" ? ext : "jpg";
    const path = `${userId}/coach-${Date.now()}.${safeExt}`;
    const { error } = await supabase.storage.from("player-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || `image/${safeExt === "jpg" ? "jpeg" : safeExt}`,
    });
    if (error) {
      console.error("coach photo upload error", error);
      return null;
    }
    const { data } = supabase.storage.from("player-photos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let resolved = photoUrl.trim();
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
      const uploaded = await uploadPhoto(photoFile);
      if (!uploaded) {
        alert(
          "Could not upload photo. If this keeps happening, ask the admin to run the Supabase migration `20260322000000_player_photos_storage.sql`, then try again."
        );
        setLoading(false);
        return;
      }
      resolved = uploaded;
    }

    if (!resolved) {
      alert("Please upload a photo or paste an image URL.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("coaches").insert({
      user_id: userId,
      bio: bio.trim() || null,
      photo_url: resolved,
    });

    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        alert("Your coach profile is already set up. Refresh the page.");
      } else {
        alert(error.message);
      }
      return;
    }
    setDone(true);
    onComplete?.();
    router.refresh();
  }

  if (done) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-6 text-center text-green-800">
          <p className="font-medium">Coach profile saved!</p>
          <p className="mt-1 text-sm">
            Ask an admin to assign you to a training group in <strong>Groups</strong> so you can take
            attendance and submit evaluations for those players.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#0066CC]/20">
      <CardHeader>
        <CardTitle>Complete your coach profile</CardTitle>
        <CardDescription>
          Quick setup — photo and a short bio. You do not need a player registration form.
        </CardDescription>
        <p className="mt-2 text-sm text-black/80">
          <strong>Name on file:</strong> {defaultName || "—"} (edit in Profile if needed)
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-[#0066CC]/20 bg-[#0066CC]/5 p-4">
            <Label htmlFor="coach-photo" className="text-base font-semibold text-[#001F3F]">
              Photo *
            </Label>
            <p className="mt-1 text-sm text-black/75">
              Clear headshot for the staff directory. Max 5 MB. JPEG, PNG, or WebP.
            </p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
              <Input
                id="coach-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full max-w-sm cursor-pointer text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#0066CC] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setPhotoFile(f);
                  if (f) setPhotoUrl("");
                }}
              />
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
            <Label htmlFor="coach-photo-url">Image URL (optional)</Label>
            <Input
              id="coach-photo-url"
              type="url"
              value={photoUrl}
              onChange={(e) => {
                const v = e.target.value;
                setPhotoUrl(v);
                if (v.trim()) setPhotoFile(null);
              }}
              placeholder="https://... if you are not uploading a file"
              disabled={!!photoFile}
            />
          </div>

          <div>
            <Label htmlFor="coach-bio">Bio (optional)</Label>
            <textarea
              id="coach-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="e.g. Assistant coach, focus on fundamentals"
              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <Button type="submit" disabled={loading} className="bg-[#0066CC] hover:bg-blue-700">
            {loading ? "Saving..." : "Save coach profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
