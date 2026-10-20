"use client";

import { SettingRow, SettingsCard } from "@/components/pages/settings/components/SettingsCard";
import { TIMEZONES } from "@/components/pages/profile/constants/profile.constants";
import { LANGUAGES } from "@/components/pages/settings/constants/settings.constants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_NAME } from "@/lib/brand";

export function GeneralSettings() {
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
        description="Used for activity timestamps and reports."
      >
        <Select defaultValue="Asia/Kolkata">
          <SelectTrigger id="default-timezone" className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
    </SettingsCard>
  );
}
