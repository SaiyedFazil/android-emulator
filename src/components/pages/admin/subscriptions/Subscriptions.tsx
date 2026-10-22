"use client";

import * as React from "react";
import {
  CircleCheck,
  CircleDollarSign,
  Clock,
  Hourglass,
  SearchX,
  TriangleAlert,
} from "lucide-react";

import { DataTable } from "@/components/custom/data-table";
import { EmptyState } from "@/components/custom/EmptyState";
import { FilterChips } from "@/components/custom/FilterChips";
import { PageHeader } from "@/components/custom/PageHeader";
import { SearchField } from "@/components/custom/SearchField";
import { StatCard } from "@/components/custom/StatCard";
import { SUBSCRIPTION_STATUS } from "@/components/pages/admin/constants/status.constants";
import { SUBSCRIPTIONS } from "@/components/pages/admin/subscriptions/constants/subscription.constants";
import {
  SUBSCRIPTION_COLUMNS,
  type SubscriptionRow,
} from "@/components/pages/admin/subscriptions/SubscriptionsColumns";
import {
  cycleAmount,
  getOrganization,
  getPlan,
  totalMrr,
} from "@/components/pages/admin/utils/admin.selectors";
import { formatCurrency } from "@/lib/format";
import type { SubscriptionStatus } from "@/types/admin.types";

type StatusFilter = "all" | SubscriptionStatus;
const STATUS_FILTERS: StatusFilter[] = ["all", "active", "trialing", "past_due", "canceled"];
const DOT_CLASS: Record<SubscriptionStatus, string> = {
  active: "bg-status-running",
  trialing: "bg-primary",
  past_due: "bg-status-booting",
  canceled: "bg-status-stopped",
};

export function Subscriptions() {
  const rows = React.useMemo<SubscriptionRow[]>(
    () =>
      SUBSCRIPTIONS.flatMap((subscription) => {
        const org = getOrganization(subscription.orgId);
        return org
          ? [
              {
                subscription,
                org,
                plan: getPlan(subscription.planId),
                amount: cycleAmount(subscription),
              },
            ]
          : [];
      }),
    []
  );
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");

  const counts = React.useMemo(() => {
    const result = { all: rows.length, active: 0, trialing: 0, past_due: 0, canceled: 0 };
    for (const row of rows) result[row.subscription.status] += 1;
    return result;
  }, [rows]);
  const cancelling = rows.filter((r) => r.subscription.cancelAtPeriodEnd).length;
  const mrr = totalMrr();
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (row) =>
        (status === "all" || row.subscription.status === status) &&
        (!q || [row.org.name, row.plan.name].some((v) => v.toLowerCase().includes(q)))
    );
  }, [rows, query, status]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Subscriptions"
        description="Every organization's plan, billing cycle and renewal."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Active"
          value={counts.active}
          hint="Paying or free"
          icon={<CircleCheck />}
        />
        <StatCard
          label="Trialing"
          value={counts.trialing}
          hint="Not charged yet"
          icon={<Hourglass />}
        />
        <StatCard
          label="Past due"
          value={counts.past_due}
          hint="Last charge failed"
          icon={<TriangleAlert />}
        />
        <StatCard
          label="Cancelling"
          value={cancelling}
          hint="At the end of the period"
          icon={<Clock />}
        />
        <StatCard
          label="MRR"
          value={formatCurrency(Math.round(mrr / 100) * 100)}
          hint={`ARR ${formatCurrency(mrr * 12, { compact: true })}`}
          icon={<CircleDollarSign />}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <DataTable
        columns={SUBSCRIPTION_COLUMNS}
        data={filtered}
        disablePagination
        hidePagination
        customLeftToolbar={
          <div className="flex w-full min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <SearchField
              value={query}
              onChange={setQuery}
              label="Search subscriptions"
              placeholder="Search by organization or plan…"
            />
            <FilterChips
              value={status}
              onChange={setStatus}
              label="Filter by status"
              options={STATUS_FILTERS.map((filter) => ({
                value: filter,
                label: filter === "all" ? "All" : SUBSCRIPTION_STATUS[filter].label,
                count: counts[filter],
                dotClassName: filter === "all" ? undefined : DOT_CLASS[filter],
              }))}
            />
          </div>
        }
        emptyStateContent={
          <EmptyState
            icon={<SearchX />}
            title="No subscriptions match"
            description="Try a different search or status."
            className="py-6"
          />
        }
      />
    </div>
  );
}
