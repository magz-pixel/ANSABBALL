export type DashboardRole = "admin" | "coach" | "parent" | "player";

export const DASHBOARD_NAV_LINKS: Record<
  DashboardRole,
  { href: string; label: string }[]
> = {
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
