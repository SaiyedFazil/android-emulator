"use client";

import { ADMIN_ALERTS } from "@/components/pages/admin/settings/constants/admin-settings.constants";
import { SettingRow, SettingsCard } from "@/components/pages/settings/components/SettingsCard";
import { Switch } from "@/components/ui/switch";

export function AdminNotifications() {
  return (
    <SettingsCard
      title="Admin alerts"
      description="Emails sent to every admin with Owner or Admin access."
    >
      {ADMIN_ALERTS.map((alert) => (
        <SettingRow
          key={alert.id}
          htmlFor={`alert-${alert.id}`}
          label={alert.label}
          description={alert.description}
        >
          <Switch id={`alert-${alert.id}`} defaultChecked={alert.defaultOn} />
        </SettingRow>
      ))}
    </SettingsCard>
  );
}
