"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AddCoachResult = { ok: true } | { ok: false; error: string };

/**
 * Adds a coach: set user's role to coach and insert into `coaches`.
 * Prefers service role when configured so RLS never blocks admin operations.
 */
export async function addCoachByEmail(emailRaw: string, bioRaw: string | null): Promise<AddCoachResult> {
  const email = emailRaw.trim().toLowerCase();
  const bio = bioRaw?.trim() || null;

  if (!email) {
    return { ok: false, error: "Email is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Not signed in." };
  }

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") {
    return { ok: false, error: "Only admins can add coaches." };
  }

  const admin = createAdminClient();
  const db = admin ?? supabase;

  const { data: target, error: findErr } = await db
    .from("users")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (findErr) {
    return { ok: false, error: findErr.message };
  }
  if (!target) {
    return { ok: false, error: "No account found with that email. They need to sign up first." };
  }

  const { error: roleErr } = await db.from("users").update({ role: "coach" }).eq("id", target.id);
  if (roleErr) {
    return { ok: false, error: roleErr.message };
  }

  const { error: insErr } = await db.from("coaches").insert({
    user_id: target.id,
    bio,
  });

  if (insErr) {
    if (insErr.code === "23505") {
      return { ok: false, error: "This user is already a coach." };
    }
    return { ok: false, error: insErr.message };
  }

  revalidatePath("/dashboard/coaches");
  revalidatePath("/dashboard/groups");
  return { ok: true };
}
