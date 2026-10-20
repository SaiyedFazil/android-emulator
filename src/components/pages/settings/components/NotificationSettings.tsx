"use client";

import { SettingRow, SettingsCard } from "@/components/pages/settings/components/SettingsCard";
import { NOTIFICATION_OPTIONS } from "@/components/pages/settings/constants/settings.constants";
import { Switch } from "@/components/ui/switch";

export function NotificationSettings() {
  return (
    <SettingsCard title="Notifications" description="Choose what you hear about, and when.">
      {NOTIFICATION_OPTIONS.map((n) => (
        <SettingRow
          key={n.id}
          htmlFor={`notify-${n.id}`}
          label={n.label}
          description={n.description}
        >
          <Switch id={`notify-${n.id}`} defaultChecked={n.defaultOn} />
        </SettingRow>
      ))}
    </SettingsCard>
  );
}
