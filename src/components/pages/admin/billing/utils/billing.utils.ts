import { INVOICES } from "@/components/pages/admin/billing/constants/invoice.constants";
import { SAMPLE_NOW } from "@/lib/sample-time";
import type { Invoice, InvoiceStatus } from "@/types/admin.types";

const monthName = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
const THIS_MONTH = SAMPLE_NOW.toISOString().slice(0, 7);

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
    const start = new Date(
      Date.UTC(SAMPLE_NOW.getUTCFullYear(), SAMPLE_NOW.getUTCMonth() - (months - 1) + index, 1)
    );
    const key = start.toISOString().slice(0, 7);
    const inMonth = (status: InvoiceStatus) =>
      total(INVOICES.filter((i) => i.status === status && i.issuedAt.startsWith(key))) / 100;
    return {
      // The current month is still running: say so, or its short bar reads as a collapse.
      month: `${monthName.format(start)}${index === months - 1 ? " (to date)" : ""}`,
      collected: inMonth("paid"),
      refunded: inMonth("refunded"),
    };
  });
}
