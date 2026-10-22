"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/custom/PageHeader";
import { PlanCard } from "@/components/pages/admin/plans/components/PlanCard";
import { PlanSheet } from "@/components/pages/admin/plans/components/PlanSheet";
import { PLANS } from "@/components/pages/admin/plans/constants/plan.constants";
import { SUBSCRIPTIONS } from "@/components/pages/admin/subscriptions/constants/subscription.constants";
import { monthlyRevenue, planSubscribers } from "@/components/pages/admin/utils/admin.selectors";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Plan } from "@/types/admin.types";

type Cycle = "monthly" | "yearly";

export function Plans() {
  const [cycle, setCycle] = React.useState<Cycle>("monthly");
  const [sheet, setSheet] = React.useState<{ open: boolean; plan: Plan | null }>({
    open: false,
    plan: null,
  });

  const stats = React.useMemo(
    () =>
      PLANS.map((plan) => ({
        plan,
        subscribers: planSubscribers(plan.id),
        mrr: SUBSCRIPTIONS.filter((s) => s.planId === plan.id).reduce(
          (sum, s) => sum + monthlyRevenue(s),
          0
        ),
      })),
    []
  );
  // "Most popular" only for a clear leader — a tie would make the badge arbitrary.
  const mostSubscribers = Math.max(...stats.map((s) => s.subscribers));
  const leaders = stats.filter((s) => s.subscribers === mostSubscribers);
  const popularId = leaders.length === 1 ? leaders[0].plan.id : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Plans"
        description="Subscription tiers. Each sets how many emulators an organization can run at once."
        actions={
          <Button size="lg" onClick={() => setSheet({ open: true, plan: null })}>
            <Plus />
            New plan
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          type="single"
          value={cycle}
          onValueChange={(value) => value && setCycle(value as Cycle)}
          aria-label="Billing cycle"
          spacing={1}
          className="rounded-lg bg-muted p-1"
        >
          <ToggleGroupItem
            value="monthly"
            size="sm"
            className="px-3 text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-xs"
          >
            Monthly
          </ToggleGroupItem>
          <ToggleGroupItem
            value="yearly"
            size="sm"
            className="gap-1.5 px-3 text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-xs"
          >
            Yearly
            <span className="rounded-full bg-status-running-soft px-1.5 text-[11px] font-medium text-status-running-foreground">
              2 months free
            </span>
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-sm text-muted-foreground">Prices in USD, excluding tax.</p>
      </div>

      <div className="grid gap-4 pt-1 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ plan, subscribers, mrr }) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            cycle={cycle}
            subscribers={subscribers}
            mrr={mrr}
            popular={plan.id === popularId}
            onEdit={() => setSheet({ open: true, plan })}
          />
        ))}
      </div>

      <PlanSheet
        open={sheet.open}
        onOpenChange={(open) => setSheet((s) => ({ ...s, open }))}
        plan={sheet.plan}
      />
    </div>
  );
}
