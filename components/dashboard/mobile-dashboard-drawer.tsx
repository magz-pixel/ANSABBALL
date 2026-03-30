"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV_LINKS, type DashboardRole } from "@/components/dashboard/dashboard-nav-config";

export function MobileDashboardDrawer({ role }: { role: DashboardRole }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = DASHBOARD_NAV_LINKS[role] ?? DASHBOARD_NAV_LINKS.player;

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const t = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    const prevOb = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prev;
      document.body.style.overscrollBehavior = prevOb;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const overlay = open ? (
    <div className="fixed inset-0 z-[9998] isolate" role="presentation">
      <button
        type="button"
        className="absolute inset-0 z-0 bg-black/60 touch-none"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
      />
      <aside
        id="dashboard-mobile-nav"
        className="absolute bottom-0 left-0 top-0 z-10 flex min-h-0 w-[min(85vw,20rem)] min-w-[240px] max-w-[20rem] flex-col border-r border-white/10 bg-[#001F3F] shadow-2xl"
        style={{
          paddingTop: "max(0px, env(safe-area-inset-top))",
          paddingBottom: "max(0px, env(safe-area-inset-bottom))",
          paddingLeft: "max(0px, env(safe-area-inset-left))",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Dashboard navigation"
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3">
          <div className="min-w-0 flex flex-col">
            <Link
              href="/"
              className="truncate text-sm font-bold text-white underline-offset-2 hover:underline"
              onClick={() => setOpen(false)}
            >
              ANSA — public site
            </Link>
            <span className="text-xs text-white/60">Menu</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-y-contain p-3 [-webkit-overflow-scrolling:touch]">
          {items.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block min-h-[48px] rounded-lg px-4 py-3.5 text-base font-medium touch-manipulation active:bg-white/10",
                  isActive
                    ? "bg-[#0066CC] text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-white/10 p-3">
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="min-h-[48px] w-full rounded-lg px-4 py-3 text-left text-base font-medium text-white/90 touch-manipulation hover:bg-white/10"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <div className="sticky top-0 z-[100] flex shrink-0 items-center gap-3 border-b border-gray-200/80 bg-white px-3 py-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-sm lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-[#001F3F] hover:bg-gray-100 touch-manipulation"
        aria-expanded={open}
        aria-controls="dashboard-mobile-nav"
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

      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </div>
  );
}
