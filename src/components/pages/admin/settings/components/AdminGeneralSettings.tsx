"use client";

import * as React from "react";

import { TIME_ZONES } from "@/components/pages/admin/settings/constants/admin-settings.constants";
import { SettingRow, SettingsCard } from "@/components/pages/settings/components/SettingsCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { APP_NAME } from "@/lib/brand";

export function AdminGeneralSettings() {
  const [maintenance, setMaintenance] = React.useState(false);

  return (
    <SettingsCard title="General" description="How the platform presents itself to everyone.">
      <SettingRow
        htmlFor="platform-name"
        label="Platform name"
        description="Shown in the console and emails."
      >
        <Input id="platform-name" defaultValue={APP_NAME} className="h-9" />
      </SettingRow>
      <SettingRow
        htmlFor="support-email"
        label="Support email"
        description="Where customers reply to."
      >
        <Input id="support-email" type="email" defaultValue="support@example.com" className="h-9" />
      </SettingRow>
      <SettingRow
        htmlFor="default-tz"
        label="Default time zone"
        description="For new organizations and reports."
      >
        <Select defaultValue="UTC">
          <SelectTrigger id="default-tz" className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_ZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow
        htmlFor="maintenance"
        label="Maintenance mode"
        description="Users see a banner and can't start new emulators. Admins keep full access."
      >
        <Switch id="maintenance" checked={maintenance} onCheckedChange={setMaintenance} />
      </SettingRow>
      {maintenance ? (
        <div className="flex flex-col gap-2 py-4 last:pb-0">
          <label htmlFor="maintenance-banner" className="text-sm font-medium">
            Banner message
          </label>
          <Textarea
            id="maintenance-banner"
            rows={2}
            defaultValue="Scheduled maintenance is in progress. Running emulators are not affected."
          />
        </div>
      ) : null}
    </SettingsCard>
  );
}
