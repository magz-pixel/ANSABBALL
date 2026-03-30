"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Keeps public.users.role aligned with auth user_metadata (signup role).
 * Run once per full dashboard mount after session exists.
 */
export function SyncRoleOnSession() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.rpc("sync_public_user_role_from_auth");
      if (!error) router.refresh();
    })();
  }, [router]);

  return null;
}
