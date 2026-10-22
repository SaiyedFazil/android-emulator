import {
  Building2,
  LayoutDashboard,
  Layers,
  Receipt,
  Repeat,
  ScrollText,
  Server,
  Settings,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";

import { ORGANIZATIONS } from "@/components/pages/admin/organizations/constants/organization.constants";
import { MEMBERS } from "@/components/pages/admin/users/constants/member.constants";
import {
  fleetCapacity,
  needsAttention,
  type AttentionKind,
} from "@/components/pages/admin/utils/admin.selectors";
import type { ShellConfig } from "@/types/nav.types";

const ATTENTION_AREA: Record<AttentionKind, string> = {
  past_due: "Billing",
  failed_payment: "Billing",
  host: "Infrastructure",
  at_limit: "Usage",
};

/** Shell for the admin console (`/admin/*`). */
export const ADMIN_SHELL: ShellConfig = {
  homeHref: "/admin/dashboard",
  tagline: "Platform console",
  badge: "Admin",
  breadcrumbRoot: "Admin",
  nav: [
    {
      label: "Overview",
      items: [{ title: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard /> }],
    },
    {
      label: "Customers",
      items: [
        {
          title: "Organizations",
          href: "/admin/organizations",
          icon: <Building2 />,
          badge: String(ORGANIZATIONS.length),
        },
        { title: "Users", href: "/admin/users", icon: <Users /> },
      ],
    },
    {
      label: "Revenue",
      items: [
        { title: "Plans", href: "/admin/plans", icon: <Layers /> },
        { title: "Subscriptions", href: "/admin/subscriptions", icon: <Repeat /> },
        { title: "Billing", href: "/admin/billing", icon: <Receipt /> },
      ],
    },
    {
      label: "Infrastructure",
      items: [
        { title: "Emulators", href: "/admin/emulators", icon: <Smartphone /> },
        { title: "Hosts", href: "/admin/hosts", icon: <Server /> },
      ],
    },
    {
      label: "Administration",
      items: [
        { title: "Audit log", href: "/admin/audit-log", icon: <ScrollText /> },
        { title: "Team", href: "/admin/team", icon: <ShieldCheck /> },
        { title: "Settings", href: "/admin/settings", icon: <Settings /> },
      ],
    },
  ],
  search: { label: "Search organizations and users", placeholder: "Search organizations, users…" },
  // TODO(api): admin alerts come from the backend; until then, the top "needs attention" items.
  notifications: needsAttention()
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: item.title,
      time: ATTENTION_AREA[item.kind],
      unread: true,
    })),
  capacity: { label: "Fleet capacity", ...fleetCapacity() },
  // TODO(auth): replace with the signed-in admin once authentication exists.
  user: { name: "Alex Morgan", email: "admin@example.com", initials: "AM", role: "Owner" },
  profileHref: "/admin/profile",
  settingsHref: "/admin/settings",
  entityNames: Object.fromEntries([
    ...ORGANIZATIONS.map((o) => [o.id, o.name]),
    ...MEMBERS.map((m) => [m.id, m.name]),
  ]),
};
