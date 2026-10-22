import { YEARLY_MONTHS } from "@/components/pages/admin/plans/constants/plan.constants";
import type { Subscription } from "@/types/admin.types";

/**
 * What one billing cycle costs: a negotiated amount wins, otherwise the plan's monthly price
 * (×10 for yearly). `null` when the plan is custom-priced and nothing was negotiated.
 */
export function cycleAmountFor(
  subscription: Pick<Subscription, "customAmount" | "billingCycle">,
  priceMonthly: number | null
): number | null {
  if (subscription.customAmount !== null) return subscription.customAmount;
  if (priceMonthly === null) return null;
  return subscription.billingCycle === "yearly" ? priceMonthly * YEARLY_MONTHS : priceMonthly;
}
