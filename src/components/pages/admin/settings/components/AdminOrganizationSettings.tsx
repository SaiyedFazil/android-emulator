"use client";

import { PLANS } from "@/components/pages/admin/plans/constants/plan.constants";
import {
  INVITE_EXPIRY_DAYS,
  TRIAL_LENGTHS,
} from "@/components/pages/admin/settings/constants/admin-settings.constants";
import { SettingRow, SettingsCard } from "@/components/pages/settings/components/SettingsCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

function DaysSelect({ id, options, value }: { id: string; options: number[]; value: number }) {
  return (
    <Select defaultValue={String(value)}>
      <SelectTrigger id={id} className="h-9 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((days) => (
          <SelectItem key={days} value={String(days)}>
            {days} days
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AdminOrganizationSettings() {
  return (
    <SettingsCard title="Organizations" description="How customers get accounts and start out.">
      <SettingRow
        htmlFor="self-signup"
        label="Self sign-up"
        description="Off: only admins create organizations and send invites."
      >
        <Switch id="self-signup" defaultChecked={false} />
      </SettingRow>
      <SettingRow
        htmlFor="default-plan"
        label="Default plan"
        description="For organizations created by an admin."
      >
        <Select defaultValue="starter">
          <SelectTrigger id="default-plan" className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLANS.filter((p) => p.visible).map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name} · {plan.concurrentEmulators} emulator
                {plan.concurrentEmulators === 1 ? "" : "s"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow
        htmlFor="trial-length"
        label="Trial length"
        description="Paid plans start with a free trial."
      >
        <DaysSelect id="trial-length" options={TRIAL_LENGTHS} value={14} />
      </SettingRow>
      <SettingRow htmlFor="invite-expiry" label="Invite links expire after">
        <DaysSelect id="invite-expiry" options={INVITE_EXPIRY_DAYS} value={7} />
      </SettingRow>
    </SettingsCard>
  );
}
