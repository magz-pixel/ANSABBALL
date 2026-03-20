"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV_LINKS, type DashboardRole } from "@/components/dashboard/dashboard-nav-config";

export function MobileDashboardDrawer({ role }: { role: DashboardRole }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = DASHBOARD_NAV_LINKS[role] ?? DASHBOARD_NAV_LINKS.player;

  // Close menu when navigating — state reset must follow navigation commit
  useEffect(() => {
    const t = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200/80 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-md supports-[padding:max(0px)]:pt-[max(0.5rem,env(safe-area-inset-top))] lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-[#001F3F] hover:bg-gray-100 touch-manipulation"
        aria-expanded={open}
        aria-label="Open dashboard menu"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-[#001F3F]">
        Dashboard
      </span>
      <span className="w-11 shrink-0" aria-hidden />

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[100] bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed inset-y-0 left-0 z-[101] flex w-[min(100vw-3rem,20rem)] flex-col border-r border-gray-200 bg-[#001F3F] shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
          >
            <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
              <span className="text-sm font-bold text-white">ANSA Dashboard</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white hover:bg-white/10"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block min-h-[48px] rounded-lg px-4 py-3.5 text-base font-medium touch-manipulation",
                      isActive
                        ? "bg-[#0066CC] text-white"
                        : "text-white/85 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/10 p-3">
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="min-h-[48px] w-full rounded-lg px-4 py-3 text-left text-base font-medium text-white/85 touch-manipulation hover:bg-white/10"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
