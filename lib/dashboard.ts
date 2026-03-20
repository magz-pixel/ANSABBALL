import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "coach" | "parent" | "player";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  approval_status: ApprovalStatus;
}

export async function getCurrentUserProfile(): Promise<{
  user: { id: string; email?: string } | null;
  profile: UserProfile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, role, full_name, approval_status")
    .eq("id", user.id)
    .single();

  return {
    user: { id: user.id, email: user.email },
    profile: profile as UserProfile | null,
  };
}

export function isAdminOrCoach(role: UserRole): boolean {
  return role === "admin" || role === "coach";
}

export function canAccessDashboard(profile: UserProfile): boolean {
  if (profile.role === "admin" || profile.role === "coach") return true;
  return profile.approval_status === "approved";
}
