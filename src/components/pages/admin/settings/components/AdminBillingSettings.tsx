"use client";

import { ToneBadge } from "@/components/custom/ToneBadge";
import { GRACE_DAYS } from "@/components/pages/admin/settings/constants/admin-settings.constants";
import { SettingRow, SettingsCard } from "@/components/pages/settings/components/SettingsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCY } from "@/lib/format";

export function AdminBillingSettings() {
  return (
    <SettingsCard
      title="Billing"
      description="How customers are charged and what happens when a charge fails."
    >
      <SettingRow
        htmlFor="currency"
        label="Currency"
        description="All plans are priced in one currency."
      >
        <Input id="currency" value={`${CURRENCY} — US dollar`} readOnly disabled className="h-9" />
      </SettingRow>
      <SettingRow
        htmlFor="tax-rate"
        label="Tax rate"
        description="Added to invoices where it applies."
      >
        <div className="flex items-center gap-2">
          <Input
            id="tax-rate"
            type="number"
            min={0}
            max={30}
            step="0.1"
            defaultValue={0}
            className="h-9"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </SettingRow>
      <SettingRow
        htmlFor="invoice-prefix"
        label="Invoice prefix"
        description="Invoice numbers continue from the last one."
      >
        <Input id="invoice-prefix" defaultValue="INV-2026-" className="h-9 font-mono" />
      </SettingRow>
      <SettingRow
        htmlFor="grace-days"
        label="Suspend after"
        description="Days a subscription can stay past due before the organization is suspended."
      >
        <Select defaultValue="7">
          <SelectTrigger id="grace-days" className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRACE_DAYS.map((days) => (
              <SelectItem key={days} value={String(days)}>
                {days} days past due
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow
        label="Payment provider"
        description="Cards are charged through the provider you connect."
      >
        <div className="flex items-center justify-end gap-3">
          <ToneBadge tone="neutral" label="Not connected" />
          {/* TODO(api): opens the provider's connect flow. */}
          <Button variant="outline" size="sm" disabled>
            Connect
          </Button>
        </div>
      </SettingRow>
    </SettingsCard>
  );
}
