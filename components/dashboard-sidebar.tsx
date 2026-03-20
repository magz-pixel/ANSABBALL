"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = {
  admin: [
    { href: "/dashboard", label: "Dashboard Home" },
    { href: "/dashboard/players", label: "Players" },
    { href: "/dashboard/attendance", label: "Attendance" },
    { href: "/dashboard/progress", label: "Progress" },
    { href: "/dashboard/groups", label: "Groups" },
    { href: "/dashboard/coaches", label: "Coaches" },
    { href: "/dashboard/announcements", label: "Announcements" },
    { href: "/dashboard/approvals", label: "Approvals" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  coach: [
    { href: "/dashboard", label: "Dashboard Home" },
    { href: "/dashboard/players", label: "Players" },
    { href: "/dashboard/attendance", label: "Attendance" },
    { href: "/dashboard/progress", label: "Progress" },
    { href: "/dashboard/groups", label: "Groups" },
    { href: "/dashboard/announcements", label: "Announcements" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  parent: [
    { href: "/dashboard", label: "Dashboard Home" },
    { href: "/dashboard/children", label: "My Children" },
    { href: "/dashboard/announcements", label: "Announcements" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  player: [
    { href: "/dashboard", label: "Dashboard Home" },
    { href: "/dashboard/player", label: "My Profile" },
    { href: "/dashboard/journal", label: "Journal" },
    { href: "/dashboard/goals", label: "Goals" },
    { href: "/dashboard/announcements", label: "Announcements" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
};

interface DashboardSidebarProps {
  role: "admin" | "coach" | "parent" | "player";
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] ?? NAV_ITEMS.player;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-[#001F3F] lg:w-72">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="rounded bg-[#0066CC] px-2 py-0.5 text-sm font-bold text-white">
            ANSA
          </span>
          <span className="hidden text-sm font-medium text-white/90 sm:inline">
            Dashboard
          </span>
        </Link>
        <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-medium capitalize text-white">
          {role}
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#0066CC] text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
