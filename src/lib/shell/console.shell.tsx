import { LayoutDashboard, Settings, Smartphone, UserRound } from "lucide-react";

import { EMULATORS } from "@/components/pages/emulators/constants/emulator.constants";
import { APP_TAGLINE } from "@/lib/brand";
import type { ShellConfig } from "@/types/nav.types";

/** Shell for the user console (`(console)` routes). */
export const CONSOLE_SHELL: ShellConfig = {
  homeHref: "/dashboard",
  tagline: APP_TAGLINE,
  nav: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
        {
          title: "Emulators",
          href: "/emulators",
          icon: <Smartphone />,
          badge: String(EMULATORS.length),
        },
      ],
    },
    {
      label: "Account",
      items: [
        { title: "Profile", href: "/profile", icon: <UserRound /> },
        { title: "Settings", href: "/settings", icon: <Settings /> },
      ],
    },
  ],
  search: { label: "Search emulators", placeholder: "Search emulators, IPs…" },
  // TODO(api): notifications come from the backend.
  notifications: [
    { id: "n1", title: "Nexus 5X went offline", time: "18 minutes ago", unread: true },
    { id: "n2", title: "Galaxy S24 is booting", time: "6 minutes ago", unread: true },
    { id: "n3", title: "Host 192.168.1.31 at 85% memory", time: "1 hour ago", unread: false },
  ],
  // TODO(api): host capacity comes from the backend.
  capacity: {
    label: "Host capacity",
    used: EMULATORS.filter((e) => e.status === "running").length,
    total: 20,
  },
  // TODO(auth): replace with the signed-in user once authentication exists.
  user: {
    name: "Priya Sharma",
    email: "priya@northwind.dev",
    initials: "PS",
    role: "Member · Northwind Labs",
  },
  profileHref: "/profile",
  settingsHref: "/settings",
};
