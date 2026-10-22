import { MRR_GROWTH } from "@/components/pages/admin/dashboard/constants/dashboard.constants";
import { ORGANIZATIONS } from "@/components/pages/admin/organizations/constants/organization.constants";
import { PLANS } from "@/components/pages/admin/plans/constants/plan.constants";
import { planSubscribers, totalMrr } from "@/components/pages/admin/utils/admin.selectors";
import { SAMPLE_NOW } from "@/lib/sample-time";
import type { Plan } from "@/types/admin.types";

const monthName = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });

/** The twelve calendar months ending with SAMPLE_NOW's, oldest first. */
const MONTHS = Array.from({ length: 12 }, (_, index) => {
  const start = new Date(
    Date.UTC(SAMPLE_NOW.getUTCFullYear(), SAMPLE_NOW.getUTCMonth() - 11 + index, 1)
  );
  return { key: start.toISOString().slice(0, 7), label: monthName.format(start) };
});

/** MRR per month in dollars (the chart's unit); the last point equals today's MRR. */
export function mrrTrend(): { month: string; mrr: number }[] {
  const mrr = totalMrr();
  return MONTHS.map((month, index) => ({
    month: month.label,
    mrr: Math.round(mrr * MRR_GROWTH[index]) / 100,
  }));
}

/** Month-over-month MRR change, percent with one decimal. */
export function mrrGrowthPercent(): number {
  const [previous, current] = MRR_GROWTH.slice(-2);
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function newOrganizationsByMonth(): { month: string; count: number }[] {
  return MONTHS.map((month) => ({
    month: month.label,
    count: ORGANIZATIONS.filter((o) => o.createdAt.startsWith(month.key)).length,
  }));
}

export function planMix(): { plan: Plan; count: number }[] {
  return PLANS.map((plan) => ({ plan, count: planSubscribers(plan.id) }));
}
