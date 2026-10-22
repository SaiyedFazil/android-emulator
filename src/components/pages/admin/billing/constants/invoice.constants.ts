import { PLANS } from "@/components/pages/admin/plans/constants/plan.constants";
import { cycleAmountFor } from "@/components/pages/admin/plans/utils/plan.utils";
import { SUBSCRIPTIONS } from "@/components/pages/admin/subscriptions/constants/subscription.constants";
import { SAMPLE_NOW, daysAgo } from "@/lib/sample-time";
import type { Invoice, InvoiceStatus } from "@/types/admin.types";

const DAY_MS = 86_400_000;
const CYCLE_DAYS = { monthly: 30, yearly: 365 };
/** How far back the sample billing history goes. */
const HISTORY_DAYS = 180;
/** Invoices are due 14 days after they are issued. */
const NET_DAYS = 14;

/**
 * The exceptions to "issued and paid on the billing date", keyed by organization, then by cycle
 * (0 = the latest). Helix and Verde's latest charges failed — why they are past due — Orbit got a
 * refund, Meridian's latest invoice is still open, and Sable's subscription ended before its last
 * renewal (that cycle is skipped) after one invoice was voided.
 */
const EXCEPTIONS: Record<string, Record<number, InvoiceStatus | "skip">> = {
  org_helix: { 0: "failed" },
  org_verde: { 0: "failed" },
  org_orbit: { 1: "refunded" },
  org_meridian: { 0: "open" },
  org_sable: { 0: "skip", 1: "void" },
};

const priceOf = Object.fromEntries(PLANS.map((p) => [p.id, p.priceMonthly]));

// TODO(api): invoices come from the billing provider. Sample history: every paying subscription
// is invoiced once per cycle, on its start date's anniversary, for the last six months.
const issued: Omit<Invoice, "id" | "number">[] = SUBSCRIPTIONS.flatMap((subscription) => {
  const amount = cycleAmountFor(subscription, priceOf[subscription.planId]) ?? 0;
  if (amount === 0 || subscription.status === "trialing") return [];
  const age = Math.floor(
    (SAMPLE_NOW.getTime() - new Date(subscription.startedAt).getTime()) / DAY_MS
  );
  const cycle = CYCLE_DAYS[subscription.billingCycle];
  const exceptions = EXCEPTIONS[subscription.orgId] ?? {};

  const invoices: Omit<Invoice, "id" | "number">[] = [];
  for (
    let index = 0, days = age % cycle;
    days <= Math.min(age, HISTORY_DAYS);
    index++, days += cycle
  ) {
    const status = exceptions[index] ?? "paid";
    if (status === "skip") continue;
    invoices.push({
      orgId: subscription.orgId,
      amount,
      status,
      issuedAt: daysAgo(days),
      dueAt: daysAgo(days - NET_DAYS),
      paidAt: status === "paid" || status === "refunded" ? daysAgo(days) : null,
    });
  }
  return invoices;
});

/** Numbered in the order they were issued. */
export const INVOICES: Invoice[] = issued
  .sort((a, b) => a.issuedAt.localeCompare(b.issuedAt))
  .map((invoice, index) => ({
    ...invoice,
    id: `inv_${String(index + 1).padStart(3, "0")}`,
    number: `INV-2026-${String(index + 1041).padStart(4, "0")}`,
  }));
