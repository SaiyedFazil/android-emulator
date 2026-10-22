import { Building2, CircleDollarSign, Repeat, Smartphone } from "lucide-react";

import { PageHeader } from "@/components/custom/PageHeader";
import { StatCard } from "@/components/custom/StatCard";
import { AdminDashboardActions } from "@/components/pages/admin/dashboard/components/AdminDashboardActions";
import { MrrChart } from "@/components/pages/admin/dashboard/components/MrrChart";
import { NeedsAttention } from "@/components/pages/admin/dashboard/components/NeedsAttention";
import { NewOrganizationsChart } from "@/components/pages/admin/dashboard/components/NewOrganizationsChart";
import { PlanMix } from "@/components/pages/admin/dashboard/components/PlanMix";
import { RecentActivity } from "@/components/pages/admin/dashboard/components/RecentActivity";
import { RecentOrganizations } from "@/components/pages/admin/dashboard/components/RecentOrganizations";
import {
  mrrGrowthPercent,
  mrrTrend,
  newOrganizationsByMonth,
  planMix,
} from "@/components/pages/admin/dashboard/utils/dashboard.utils";
import { HOSTS } from "@/components/pages/admin/hosts/constants/host.constants";
import { SUBSCRIPTIONS } from "@/components/pages/admin/subscriptions/constants/subscription.constants";
import {
  fleetCapacity,
  needsAttention,
  organizationStatusCounts,
  totalMrr,
} from "@/components/pages/admin/utils/admin.selectors";
import { formatCurrency } from "@/lib/format";

export function AdminDashboard() {
  // Same breakdown as the Organizations page's status chips.
  const orgCounts = organizationStatusCounts();
  const countSubs = (status: string) => SUBSCRIPTIONS.filter((s) => s.status === status).length;
  // Whole dollars on the tile; the chart's tooltip shows the exact figure.
  const mrr = Math.round(totalMrr() / 100) * 100;
  const capacity = fleetCapacity();
  const reachableHosts = HOSTS.filter((h) => h.status !== "offline").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Customers, revenue and the fleet at a glance."
        actions={<AdminDashboardActions />}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Active organizations"
          value={orgCounts.active}
          hint={`${orgCounts.trialing} trialing · ${orgCounts.past_due} past due · ${orgCounts.suspended} suspended`}
          icon={<Building2 />}
        />
        <StatCard
          label="MRR"
          value={formatCurrency(mrr)}
          trend={{ percent: mrrGrowthPercent(), label: "vs last month" }}
          hint={`ARR ${formatCurrency(mrr * 12, { compact: true })}`}
          icon={<CircleDollarSign />}
        />
        <StatCard
          label="Active subscriptions"
          value={countSubs("active")}
          hint={`${countSubs("trialing")} trialing · ${countSubs("past_due")} past due`}
          icon={<Repeat />}
        />
        <StatCard
          label="Emulators running"
          value={capacity.used}
          hint={`of ${capacity.total} slots on ${reachableHosts} hosts`}
          icon={<Smartphone />}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <MrrChart
          data={mrrTrend()}
          current={mrr}
          growth={mrrGrowthPercent()}
          className="lg:col-span-2"
        />
        <NeedsAttention items={needsAttention()} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <RecentOrganizations className="lg:col-span-2" />
        <PlanMix mix={planMix()} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <NewOrganizationsChart data={newOrganizationsByMonth()} />
        <RecentActivity className="lg:col-span-2" />
      </div>
    </div>
  );
}
