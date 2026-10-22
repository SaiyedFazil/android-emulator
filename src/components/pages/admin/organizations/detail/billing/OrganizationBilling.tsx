import { ChartCard } from "@/components/custom/ChartCard";
import { DetailList } from "@/components/custom/DetailList";
import { PlanBadge } from "@/components/custom/PlanBadge";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { SUBSCRIPTION_STATUS } from "@/components/pages/admin/constants/status.constants";
import { ChangePlanButton } from "@/components/pages/admin/organizations/detail/overview/ChangePlanButton";
import { InvoicesTable } from "@/components/pages/admin/shared/InvoicesTable";
import {
  cycleAmount,
  getPlan,
  invoicesOf,
  monthlyRevenue,
  subscriptionFor,
} from "@/components/pages/admin/utils/admin.selectors";
import { formatCurrency, formatDate, formatPrice } from "@/lib/format";
import type { Organization } from "@/types/admin.types";

export function OrganizationBilling({ org }: { org: Organization }) {
  const subscription = subscriptionFor(org.id);
  const status = SUBSCRIPTION_STATUS[subscription.status];
  const yearly = subscription.billingCycle === "yearly";
  const renewal = subscription.trialEndsAt ?? subscription.renewsAt;

  return (
    <div className="flex flex-col gap-4">
      <ChartCard title="Subscription" action={<ChangePlanButton name={org.name} />}>
        <DetailList
          columns={2}
          items={[
            { label: "Plan", value: <PlanBadge plan={getPlan(subscription.planId)} /> },
            { label: "Status", value: <ToneBadge tone={status.tone} label={status.label} /> },
            {
              label: "Amount",
              value: `${formatPrice(cycleAmount(subscription))} / ${yearly ? "year" : "month"}`,
            },
            { label: "MRR", value: formatCurrency(monthlyRevenue(subscription)) },
            {
              label: subscription.trialEndsAt
                ? "Trial ends"
                : subscription.cancelAtPeriodEnd
                  ? "Ends"
                  : "Renews",
              value: renewal ? formatDate(renewal) : "—",
            },
            { label: "Started", value: formatDate(subscription.startedAt) },
            {
              label: "Payment method",
              value: org.paymentMethod
                ? `${org.paymentMethod.brand} •••• ${org.paymentMethod.last4}`
                : "None on file",
            },
            { label: "Billing email", value: org.billingEmail },
          ]}
        />
      </ChartCard>
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Invoices</h2>
        <InvoicesTable invoices={invoicesOf(org.id)} />
      </div>
    </div>
  );
}
