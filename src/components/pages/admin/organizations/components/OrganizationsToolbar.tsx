"use client";

import { FilterChips } from "@/components/custom/FilterChips";
import { SearchField } from "@/components/custom/SearchField";
import { ORG_STATUS } from "@/components/pages/admin/constants/status.constants";
import {
  ORG_STATUS_FILTERS,
  type OrgStatusFilter,
  type PlanFilter,
} from "@/components/pages/admin/organizations/utils/organization.utils";
import { PLANS } from "@/components/pages/admin/plans/constants/plan.constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DOT_CLASS: Record<Exclude<OrgStatusFilter, "all">, string> = {
  active: "bg-status-running",
  trialing: "bg-primary",
  past_due: "bg-status-booting",
  suspended: "bg-status-offline",
};

interface OrganizationsToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  status: OrgStatusFilter;
  onStatusChange: (status: OrgStatusFilter) => void;
  plan: PlanFilter;
  onPlanChange: (plan: PlanFilter) => void;
  counts: Record<OrgStatusFilter, number>;
}

export function OrganizationsToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  plan,
  onPlanChange,
  counts,
}: OrganizationsToolbarProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
        <SearchField
          value={query}
          onChange={onQueryChange}
          label="Search organizations"
          placeholder="Search by name, id or billing email…"
        />
        <Select value={plan} onValueChange={(value) => onPlanChange(value as PlanFilter)}>
          <SelectTrigger aria-label="Filter by plan" className="h-9 w-full bg-card sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            {PLANS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <FilterChips
        value={status}
        onChange={onStatusChange}
        label="Filter by status"
        options={ORG_STATUS_FILTERS.map((filter) => ({
          value: filter,
          label: filter === "all" ? "All" : ORG_STATUS[filter].label,
          count: counts[filter],
          dotClassName: filter === "all" ? undefined : DOT_CLASS[filter],
        }))}
      />
    </div>
  );
}
