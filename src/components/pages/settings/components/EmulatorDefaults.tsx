"use client";

import { SettingRow, SettingsCard } from "@/components/pages/settings/components/SettingsCard";
import {
  ANDROID_VERSIONS,
  CPU_OPTIONS,
  RAM_OPTIONS,
} from "@/components/pages/settings/constants/settings.constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function EmulatorDefaults() {
  return (
    <SettingsCard
      title="Emulator defaults"
      description="Starting values for every new emulator. You can change them per emulator."
    >
      <SettingRow htmlFor="default-android" label="Android version">
        <Select defaultValue="35">
          <SelectTrigger id="default-android" className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANDROID_VERSIONS.map((v) => (
              <SelectItem key={v.value} value={v.value}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow
        htmlFor="default-ram"
        label="Memory"
        description="RAM allocated to each emulator."
      >
        <Select defaultValue="4">
          <SelectTrigger id="default-ram" className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RAM_OPTIONS.map((gb) => (
              <SelectItem key={gb} value={gb}>
                {gb} GB
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow htmlFor="default-cpu" label="CPU cores">
        <Select defaultValue="4">
          <SelectTrigger id="default-cpu" className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CPU_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c} cores
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow
        htmlFor="auto-start"
        label="Start after creating"
        description="Boot a new emulator as soon as it is created."
      >
        <Switch id="auto-start" defaultChecked />
      </SettingRow>
      <SettingRow
        htmlFor="cold-boot"
        label="Always cold boot"
        description="Skip saved snapshots. Slower to start, but always a clean state."
      >
        <Switch id="cold-boot" />
      </SettingRow>
    </SettingsCard>
  );
}
