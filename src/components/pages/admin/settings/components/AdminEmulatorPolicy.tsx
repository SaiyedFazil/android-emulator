"use client";

import {
  ANDROID_VERSIONS,
  IDLE_STOP,
  MAX_SESSION,
} from "@/components/pages/admin/settings/constants/admin-settings.constants";
import { SettingRow, SettingsCard } from "@/components/pages/settings/components/SettingsCard";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function OptionSelect({
  id,
  options,
  value,
}: {
  id: string;
  options: { value: string; label: string }[];
  value: string;
}) {
  return (
    <Select defaultValue={value}>
      <SelectTrigger id={id} className="h-9 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AdminEmulatorPolicy() {
  return (
    <SettingsCard
      title="Emulators"
      description="Limits that apply to every organization's emulators."
    >
      <SettingRow
        htmlFor="idle-stop"
        label="Stop idle emulators"
        description="Frees slots nobody is using."
      >
        <OptionSelect id="idle-stop" options={IDLE_STOP} value="30" />
      </SettingRow>
      <SettingRow
        htmlFor="max-session"
        label="Maximum session length"
        description="Emulators stop after this long."
      >
        <OptionSelect id="max-session" options={MAX_SESSION} value="8" />
      </SettingRow>
      <div className="flex flex-col gap-3 py-4 last:pb-0">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Allowed Android versions</span>
          <p className="text-xs text-muted-foreground">
            Members can only create emulators on these.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ANDROID_VERSIONS.map((v) => (
            <label
              key={v.version}
              htmlFor={`android-${v.version}`}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-accent"
            >
              <Checkbox id={`android-${v.version}`} defaultChecked={v.enabled} />
              <span>
                Android {v.version}
                <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">
                  API {v.api}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </SettingsCard>
  );
}
