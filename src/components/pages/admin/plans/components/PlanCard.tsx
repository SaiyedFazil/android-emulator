import { Pencil, Smartphone } from "lucide-react";

import { ToneBadge } from "@/components/custom/ToneBadge";
import { YEARLY_MONTHS } from "@/components/pages/admin/plans/constants/plan.constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types/admin.types";

interface PlanCardProps {
  plan: Plan;
  cycle: "monthly" | "yearly";
  subscribers: number;
  mrr: number;
  popular: boolean;
  onEdit: () => void;
}

export function PlanCard({ plan, cycle, subscribers, mrr, popular, onEdit }: PlanCardProps) {
  const yearly = cycle === "yearly";
  const price =
    plan.priceMonthly === null ? null : plan.priceMonthly * (yearly ? YEARLY_MONTHS : 1);

  return (
    <Card className={cn("gap-5 p-5", popular && "ring-2 ring-primary")}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            {plan.name}
            {popular ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold tracking-normal text-primary-foreground">
                Most popular
              </span>
            ) : null}
          </h2>
          <ToneBadge
            tone={plan.status === "active" ? "success" : "neutral"}
            label={plan.status === "active" ? "Active" : "Archived"}
          />
        </div>
        <p className="min-h-10 text-sm text-muted-foreground">{plan.description}</p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="font-mono text-3xl font-semibold tracking-tight tabular">
          {formatPrice(price)}
        </span>
        {price !== null ? (
          <span className="text-sm text-muted-foreground">/{yearly ? "year" : "month"}</span>
        ) : (
          <span className="text-sm text-muted-foreground">negotiated</span>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Smartphone className="size-4" aria-hidden="true" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-xl font-semibold tabular">
            {plan.concurrentEmulators}
          </span>
          <span className="text-xs text-muted-foreground">Concurrent emulators</span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Organizations</dt>
          <dd className="font-mono font-medium tabular">{subscribers}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">MRR</dt>
          <dd className="font-mono font-medium tabular">{formatCurrency(mrr)}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {plan.visible ? "Offered at sign-up" : "Sales-led · hidden at sign-up"}
        </span>
        <Button variant="outline" size="sm" onClick={onEdit} aria-label={`Edit ${plan.name}`}>
          <Pencil />
          Edit
        </Button>
      </div>
    </Card>
  );
}
