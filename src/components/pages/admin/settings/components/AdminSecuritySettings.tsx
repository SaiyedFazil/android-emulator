"use client";

import { SESSION_TIMEOUTS } from "@/components/pages/admin/settings/constants/admin-settings.constants";
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

export function AdminSecuritySettings() {
  return (
    <SettingsCard title="Security" description="Sign-in rules for admins and members.">
      <SettingRow
        htmlFor="require-2fa"
        label="Require 2FA for admins"
        description="Admins without two-factor can't open the admin console."
      >
        <Switch id="require-2fa" defaultChecked />
      </SettingRow>
      <SettingRow
        htmlFor="session-timeout"
        label="Session timeout"
        description="Idle time before signing out."
      >
        <Select defaultValue="8h">
          <SelectTrigger id="session-timeout" className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SESSION_TIMEOUTS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow htmlFor="password-length" label="Minimum password length">
        <Input
          id="password-length"
          type="number"
          min={8}
          max={64}
          defaultValue={12}
          className="h-9"
        />
      </SettingRow>
      <div className="flex flex-col gap-2 py-4 last:pb-0">
        <label htmlFor="admin-ips" className="text-sm font-medium">
          Admin IP allow-list
        </label>
        <p className="text-xs text-muted-foreground">
          One address or CIDR range per line. Leave empty to allow admins from anywhere.
        </p>
        <Textarea
          id="admin-ips"
          rows={3}
          placeholder={"203.0.113.0/24\n198.51.100.7"}
          className="font-mono text-sm"
        />
      </div>
    </SettingsCard>
  );
}
