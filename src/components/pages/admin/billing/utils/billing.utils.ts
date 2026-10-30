import { INVOICES } from "@/components/pages/admin/billing/constants/invoice.constants";
import { SAMPLE_NOW } from "@/lib/sample-time";
import type { Invoice, InvoiceStatus } from "@/types/admin.types";

// Sample invoices are grouped by UTC calendar month (their ISO dates' "YYYY-MM").
const MONTH_KEY = "YYYY-MM";
const THIS_MONTH = SAMPLE_NOW.format(MONTH_KEY);

const total = (invoices: Invoice[]) => invoices.reduce((sum, i) => sum + i.amount, 0);
const withStatus = (status: InvoiceStatus) => INVOICES.filter((i) => i.status === status);

/** Headline billing figures, in cents. "This month" is SAMPLE_NOW's calendar month. */
export function billingTotals() {
  const failed = withStatus("failed");
  const open = withStatus("open");
  const refunded = withStatus("refunded");
  return {
    collectedThisMonth: total(withStatus("paid").filter((i) => i.issuedAt.startsWith(THIS_MONTH))),
    // Everything invoiced this month, whatever its state — the yardstick for "collected so far".
    billedThisMonth: total(
      INVOICES.filter((i) => i.issuedAt.startsWith(THIS_MONTH) && i.status !== "void")
    ),
    outstanding: total(open),
    outstandingCount: open.length,
    failed: total(failed),
    failedCount: failed.length,
    refunded: total(refunded),
    refundedCount: refunded.length,
  };
}

/** Collected (paid) and refunded per issue month, oldest first, in dollars for the chart. */
export function revenueByMonth(
  months = 6
): { month: string; collected: number; refunded: number }[] {
  return Array.from({ length: months }, (_, index) => {
    const start = SAMPLE_NOW.startOf("month").subtract(months - 1 - index, "month");
    const key = start.format(MONTH_KEY);
    const inMonth = (status: InvoiceStatus) =>
      total(INVOICES.filter((i) => i.status === status && i.issuedAt.startsWith(key))) / 100;
    return {
      // The current month is still running: say so, or its short bar reads as a collapse.
      month: `${start.format("MMM")}${index === months - 1 ? " (to date)" : ""}`,
      collected: inMonth("paid"),
      refunded: inMonth("refunded"),
    };
  });
}
