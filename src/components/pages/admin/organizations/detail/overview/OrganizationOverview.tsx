import Link from "next/link";
import { CalendarClock, CircleDollarSign, Smartphone, Users } from "lucide-react";

import { ChartCard } from "@/components/custom/ChartCard";
import { DetailList } from "@/components/custom/DetailList";
import { StatCard } from "@/components/custom/StatCard";
import { CurrentPlanCard } from "@/components/pages/admin/organizations/detail/overview/CurrentPlanCard";
import { UsageChart } from "@/components/pages/admin/organizations/detail/overview/UsageChart";
import { AuditTimeline } from "@/components/pages/admin/shared/AuditTimeline";
import {
  auditFor,
  getMember,
  getPlan,
  membersOf,
  monthlyRevenue,
  organizationUsage,
  subscriptionFor,
  usageHistory,
} from "@/components/pages/admin/utils/admin.selectors";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";
import type { Organization } from "@/types/admin.types";

export function OrganizationOverview({ org }: { org: Organization }) {
  const subscription = subscriptionFor(org.id);
  const plan = getPlan(subscription.planId);
  const usage = organizationUsage(org.id);
  const members = membersOf(org.id);
  const count = (status: string) => members.filter((m) => m.status === status).length;
  const owner = getMember(org.ownerId);
  const renewal = subscription.trialEndsAt ?? subscription.renewsAt;
  const over = usage.inUse - usage.limit;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Emulators in use"
          value={
            <>
              {usage.inUse}
              <span className="text-lg text-muted-foreground"> / {usage.limit}</span>
            </>
          }
          hint={
            over > 0 ? `Over limit by ${over}` : `${usage.limit - usage.inUse} free on ${plan.name}`
          }
          icon={<Smartphone />}
        />
        <StatCard
          label="Members"
          value={count("active")}
          hint={`${count("invited")} invited · ${count("suspended")} suspended`}
          icon={<Users />}
        />
        <StatCard
          label="MRR"
          value={formatCurrency(monthlyRevenue(subscription))}
          hint={
            subscription.status === "trialing"
              ? "Trial — not charged yet"
              : `${subscription.billingCycle === "yearly" ? "Yearly" : "Monthly"} billing`
          }
          icon={<CircleDollarSign />}
        />
        <StatCard
          label={subscription.trialEndsAt ? "Trial ends" : "Next renewal"}
          value={renewal ? formatDate(renewal) : "—"}
          hint={renewal ? formatRelativeTime(renewal, SAMPLE_NOW) : "Nothing scheduled"}
          icon={<CalendarClock />}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <UsageChart data={usageHistory(org.id)} limit={usage.limit} className="lg:col-span-2" />
        <CurrentPlanCard org={org} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <ChartCard title="Details" className="lg:col-span-2">
          <DetailList
            columns={2}
            items={[
              { label: "Organization ID", value: org.id, mono: true },
              { label: "Slug", value: org.slug, mono: true },
              {
                label: "Owner",
                value: owner ? (
                  <Link href={`/admin/users/${owner.id}`} className="text-primary hover:underline">
                    {owner.name}
                  </Link>
                ) : (
                  "—"
                ),
              },
              { label: "Billing email", value: org.billingEmail },
              { label: "Country", value: org.country },
              { label: "Members", value: `${members.length} (${count("active")} active)` },
              { label: "Created", value: formatDate(org.createdAt) },
              {
                label: "Payment method",
                value: org.paymentMethod
                  ? `${org.paymentMethod.brand} •••• ${org.paymentMethod.last4}`
                  : "None on file",
              },
            ]}
          />
        </ChartCard>
        <ChartCard title="Recent activity">
          <AuditTimeline events={auditFor(org.id).slice(0, 5)} />
        </ChartCard>
      </div>
    </div>
  );
}
