"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardPendingApproval } from "../dashboard-pending-approval";
import { PlayerProfileForm } from "./player-profile-form";

interface PendingApprovalWrapperProps {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  hasPlayerProfile: boolean;
}

export function PendingApprovalWrapper({
  userId,
  email,
  fullName,
  role,
  hasPlayerProfile,
}: PendingApprovalWrapperProps) {
  const router = useRouter();

  const checkApproval = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("approval_status")
      .eq("id", userId)
      .single();
    if (data?.approval_status === "approved") {
      router.refresh();
    }
  }, [userId, router]);

  useEffect(() => {
    const interval = setInterval(checkApproval, 4000);
    return () => clearInterval(interval);
  }, [checkApproval]);

  return (
    <div className="space-y-8">
      {role === "player" && !hasPlayerProfile && (
        <PlayerProfileForm
          userId={userId}
          defaultName={fullName}
          onComplete={() => router.refresh()}
        />
      )}
      <DashboardPendingApproval email={email} fullName={fullName} />
    </div>
  );
}
