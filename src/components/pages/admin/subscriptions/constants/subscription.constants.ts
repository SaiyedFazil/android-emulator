import { daysAgo, daysFromNow } from "@/lib/sample-time";
import type { BillingCycle, PlanId, Subscription, SubscriptionStatus } from "@/types/admin.types";

type Row = [
  orgId: string,
  planId: PlanId,
  status: SubscriptionStatus,
  cycle: BillingCycle,
  customAmount: number | null,
  startedDaysAgo: number,
  renewsInDays: number | null,
  trialEndsInDays: number | null,
  cancelAtPeriodEnd: boolean,
];

// TODO(api): one subscription per organization, from the billing backend.
// prettier-ignore
const ROWS: Row[] = [
  ["org_northwind", "business", "active", "yearly", null, 400, 330, null, false],
  ["org_quartz", "starter", "trialing", "monthly", null, 6, 8, 8, false],
  ["org_helix", "team", "past_due", "monthly", null, 280, 27, null, false],
  ["org_meridian", "enterprise", "active", "monthly", 249000, 520, 9, null, false],
  ["org_orbit", "business", "active", "monthly", null, 200, 14, null, false],
  ["org_lumen", "team", "active", "yearly", null, 150, 215, null, false],
  ["org_cascade", "starter", "active", "monthly", null, 95, 20, null, false],
  ["org_pixelforge", "free", "active", "monthly", null, 40, null, null, false],
  ["org_atlas", "starter", "active", "monthly", null, 130, 11, null, true],
  ["org_verde", "team", "past_due", "monthly", null, 240, 5, null, false],
  ["org_kestrel", "business", "trialing", "monthly", null, 4, 10, 10, false],
  ["org_sable", "starter", "canceled", "monthly", null, 300, null, null, false],
];

export const SUBSCRIPTIONS: Subscription[] = ROWS.map(
  ([orgId, planId, status, billingCycle, customAmount, started, renews, trialEnds, cancel]) => ({
    id: `sub_${orgId.replace(/^org_/, "")}`,
    orgId,
    planId,
    status,
    billingCycle,
    customAmount,
    startedAt: daysAgo(started),
    renewsAt: renews === null ? null : daysFromNow(renews),
    trialEndsAt: trialEnds === null ? null : daysFromNow(trialEnds),
    cancelAtPeriodEnd: cancel,
  })
);
