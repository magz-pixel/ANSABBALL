import type { SupabaseClient } from "@supabase/supabase-js";

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validatePlayerPhotoFile(file: File): string | null {
  if (file.size > PHOTO_MAX_BYTES) return "Photo must be 5 MB or smaller.";
  if (!ACCEPT_TYPES.includes(file.type)) {
    return "Please use a JPEG, PNG, or WebP image.";
  }
  return null;
}

export async function uploadPlayerPhoto(
  supabase: SupabaseClient,
  file: File,
  prefix: string
): Promise<string | null> {
  const validation = validatePlayerPhotoFile(file);
  if (validation) {
    alert(validation);
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split(".").pop()?.toLowerCase();
  const safeExt =
    ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp" ? ext : "jpg";
  const path = `${user.id}/${Date.now()}-${prefix}.${safeExt}`;

  const { error } = await supabase.storage.from("player-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || `image/${safeExt === "jpg" ? "jpeg" : safeExt}`,
  });

  if (error) {
    alert(
      `Unable to upload photo: ${error.message}\n\nIf this keeps happening, run Supabase migration 20260322000000_player_photos_storage.sql.`
    );
    return null;
  }

  const { data } = supabase.storage.from("player-photos").getPublicUrl(path);
  return data.publicUrl;
}
