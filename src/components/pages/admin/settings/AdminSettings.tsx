import {
  Bell,
  Building2,
  CreditCard,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
} from "lucide-react";

import { PageHeader } from "@/components/custom/PageHeader";
import { SectionTabs, type SectionTab } from "@/components/custom/SectionTabs";
import { AdminBillingSettings } from "@/components/pages/admin/settings/components/AdminBillingSettings";
import { AdminEmulatorPolicy } from "@/components/pages/admin/settings/components/AdminEmulatorPolicy";
import { AdminGeneralSettings } from "@/components/pages/admin/settings/components/AdminGeneralSettings";
import { AdminNotifications } from "@/components/pages/admin/settings/components/AdminNotifications";
import { AdminOrganizationSettings } from "@/components/pages/admin/settings/components/AdminOrganizationSettings";
import { AdminSecuritySettings } from "@/components/pages/admin/settings/components/AdminSecuritySettings";

const TABS: SectionTab[] = [
  {
    value: "general",
    label: "General",
    description: "Name, support email, maintenance",
    icon: <SlidersHorizontal />,
    content: <AdminGeneralSettings />,
  },
  {
    value: "organizations",
    label: "Organizations",
    description: "Sign-up, default plan, trials",
    icon: <Building2 />,
    content: <AdminOrganizationSettings />,
  },
  {
    value: "billing",
    label: "Billing",
    description: "Currency, tax, payment provider",
    icon: <CreditCard />,
    content: <AdminBillingSettings />,
  },
  {
    value: "security",
    label: "Security",
    description: "2FA, sessions, passwords",
    icon: <ShieldCheck />,
    content: <AdminSecuritySettings />,
  },
  {
    value: "emulators",
    label: "Emulators",
    description: "Idle stop, sessions, versions",
    icon: <Smartphone />,
    content: <AdminEmulatorPolicy />,
  },
  {
    value: "alerts",
    label: "Admin alerts",
    description: "What admins are emailed about",
    icon: <Bell />,
    content: <AdminNotifications />,
  },
];

export function AdminSettings() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Platform-wide settings. Changes apply to every organization."
      />
      <SectionTabs tabs={TABS} label="Settings sections" />
    </div>
  );
}
