import { CircleDollarSign, CreditCard, Hourglass, Undo2 } from "lucide-react";

import { PageHeader } from "@/components/custom/PageHeader";
import { StatCard } from "@/components/custom/StatCard";
import { INVOICES } from "@/components/pages/admin/billing/constants/invoice.constants";
import { RevenueChart } from "@/components/pages/admin/billing/components/RevenueChart";
import {
  billingTotals,
  revenueByMonth,
} from "@/components/pages/admin/billing/utils/billing.utils";
import { InvoicesTable } from "@/components/pages/admin/shared/InvoicesTable";
import { formatCurrency } from "@/lib/format";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function Billing() {
  const totals = billingTotals();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Billing"
        description="Revenue collected, money outstanding and every invoice."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Collected so far"
          value={formatCurrency(totals.collectedThisMonth)}
          hint={`of ${formatCurrency(totals.billedThisMonth)} billed this month`}
          icon={<CircleDollarSign />}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(totals.outstanding)}
          hint={`${plural(totals.outstandingCount, "open invoice")}`}
          icon={<Hourglass />}
        />
        <StatCard
          label="Failed payments"
          value={totals.failedCount}
          hint={`${formatCurrency(totals.failed)} to recover`}
          icon={<CreditCard />}
        />
        <StatCard
          label="Refunds"
          value={formatCurrency(totals.refunded)}
          hint={plural(totals.refundedCount, "refunded invoice")}
          icon={<Undo2 />}
        />
      </div>

      <RevenueChart data={revenueByMonth()} />

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Invoices</h2>
        <InvoicesTable invoices={INVOICES} showOrganization filters />
      </div>
    </div>
  );
}
