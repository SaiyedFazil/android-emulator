import { LayoutDashboard, Settings, Smartphone, UserRound } from "lucide-react";

import { EMULATORS } from "@/components/pages/emulators/constants/emulator.constants";
import type { NavGroup } from "@/types/nav.types";

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        title: "Emulators",
        href: "/emulators",
        icon: Smartphone,
        badge: String(EMULATORS.length),
      },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Profile", href: "/profile", icon: UserRound },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

// TODO(auth): replace with the signed-in user once authentication exists.
export const CURRENT_USER = {
  name: "Admin User",
  email: "admin@example.com",
  initials: "AU",
  role: "Administrator",
};

// TODO(api): host capacity comes from the backend.
export const HOST_CAPACITY = {
  used: EMULATORS.filter((e) => e.status === "running").length,
  total: 20,
};

// TODO(api): notifications come from the backend.
export const NOTIFICATIONS = [
  { id: "n1", title: "Nexus 5X went offline", time: "18 minutes ago", unread: true },
  { id: "n2", title: "Galaxy S24 is booting", time: "6 minutes ago", unread: true },
  { id: "n3", title: "Host 192.168.1.31 at 85% memory", time: "1 hour ago", unread: false },
];
