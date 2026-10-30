"use client";

import * as React from "react";

import { TimezoneSelect } from "@/components/custom/TimezoneSelect";
import { SettingRow, SettingsCard } from "@/components/pages/settings/components/SettingsCard";
import { LANGUAGES } from "@/components/pages/settings/constants/settings.constants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTimeZone } from "@/hooks/use-time-zone";
import { APP_NAME } from "@/lib/brand";

export function GeneralSettings() {
  // TODO(api): saved with the workspace settings (Phase 5). Until then it starts at this device's zone.
  const deviceZone = useTimeZone();
  const [timeZone, setTimeZone] = React.useState<string | null>(null);

  return (
    <SettingsCard title="General" description="Workspace name, language and regional format.">
      <SettingRow
        htmlFor="workspace-name"
        label="Workspace name"
        description="Shown in the sidebar and browser tab."
      >
        <Input id="workspace-name" defaultValue={APP_NAME} className="h-9" />
      </SettingRow>
      <SettingRow htmlFor="language" label="Language">
        <Select defaultValue="en">
          <SelectTrigger id="language" className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow
        htmlFor="default-timezone"
        label="Time zone"
        description="Used for reports and emails. Times on screen follow each device's time zone."
      >
        <TimezoneSelect
          id="default-timezone"
          value={timeZone ?? deviceZone ?? "UTC"}
          onChange={setTimeZone}
        />
      </SettingRow>
    </SettingsCard>
  );
}
