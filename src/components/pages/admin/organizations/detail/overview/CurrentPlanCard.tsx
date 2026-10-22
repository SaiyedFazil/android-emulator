import { TriangleAlert } from "lucide-react";

import { ChartCard } from "@/components/custom/ChartCard";
import { DetailList } from "@/components/custom/DetailList";
import { PlanBadge } from "@/components/custom/PlanBadge";
import { UsageMeter } from "@/components/custom/UsageMeter";
import { ChangePlanButton } from "@/components/pages/admin/organizations/detail/overview/ChangePlanButton";
import {
  cycleAmount,
  getPlan,
  organizationUsage,
  subscriptionFor,
} from "@/components/pages/admin/utils/admin.selectors";
import { formatDate, formatPrice } from "@/lib/format";
import type { Organization } from "@/types/admin.types";

export function CurrentPlanCard({ org }: { org: Organization }) {
  const subscription = subscriptionFor(org.id);
  const plan = getPlan(subscription.planId);
  const usage = organizationUsage(org.id);
  const yearly = subscription.billingCycle === "yearly";
  const renewal = subscription.trialEndsAt ?? subscription.renewsAt;

  return (
    <ChartCard
      title="Current plan"
      action={<ChangePlanButton name={org.name} />}
      contentClassName="flex flex-col gap-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <PlanBadge plan={plan} className="text-sm" />
        <span className="font-mono text-xl font-semibold tabular">
          {formatPrice(cycleAmount(subscription))}
          <span className="ml-0.5 font-sans text-sm font-normal text-muted-foreground">
            /{yearly ? "year" : "month"}
          </span>
        </span>
      </div>
      <p className="-mt-2 text-sm text-muted-foreground">{plan.description}</p>
      <UsageMeter used={usage.inUse} limit={usage.limit} label="Concurrent emulators" />
      <DetailList
        columns={2}
        items={[
          { label: "Billing cycle", value: yearly ? "Yearly" : "Monthly" },
          { label: "Started", value: formatDate(subscription.startedAt) },
          {
            label: subscription.trialEndsAt
              ? "Trial ends"
              : subscription.cancelAtPeriodEnd
                ? "Ends"
                : "Renews",
            value: renewal ? formatDate(renewal) : "—",
          },
          {
            label: "Payment method",
            value: org.paymentMethod
              ? `${org.paymentMethod.brand} •••• ${org.paymentMethod.last4}`
              : "None on file",
          },
        ]}
      />
      {subscription.cancelAtPeriodEnd ? (
        <p className="flex items-center gap-2 rounded-lg bg-status-booting-soft px-3 py-2 text-sm text-status-booting-foreground">
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          Cancels at the end of the current period.
        </p>
      ) : null}
    </ChartCard>
  );
}
