import { Bell, Palette, Smartphone, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/custom/PageHeader";
import { SectionTabs, type SectionTab } from "@/components/custom/SectionTabs";
import { AppearanceSettings } from "@/components/pages/settings/components/AppearanceSettings";
import { EmulatorDefaults } from "@/components/pages/settings/components/EmulatorDefaults";
import { GeneralSettings } from "@/components/pages/settings/components/GeneralSettings";
import { NotificationSettings } from "@/components/pages/settings/components/NotificationSettings";

const TABS: SectionTab[] = [
  {
    value: "general",
    label: "General",
    description: "Name, language and time zone",
    icon: <SlidersHorizontal />,
    content: <GeneralSettings />,
  },
  {
    value: "appearance",
    label: "Appearance",
    description: "Theme and density",
    icon: <Palette />,
    content: <AppearanceSettings />,
  },
  {
    value: "emulators",
    label: "Emulator defaults",
    description: "Starting values for new emulators",
    icon: <Smartphone />,
    content: <EmulatorDefaults />,
  },
  {
    value: "notifications",
    label: "Notifications",
    description: "Alerts and summaries",
    icon: <Bell />,
    content: <NotificationSettings />,
  },
];

export function Settings() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Preferences for this workspace and your account." />
      <SectionTabs tabs={TABS} label="Settings sections" />
    </div>
  );
}
