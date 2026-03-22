"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Sends users who still owe consent to /dashboard/consent (approved dashboard only).
 */
export function ConsentRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname?.startsWith("/dashboard")) return;
    if (pathname === "/dashboard/consent") return;

    let cancelled = false;
    (async () => {
      const res = await fetch("/api/consent/status", { credentials: "same-origin" });
      if (cancelled || !res.ok) return;
      const data = (await res.json()) as { needsConsent?: boolean };
      if (data.needsConsent) {
        router.replace("/dashboard/consent");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
