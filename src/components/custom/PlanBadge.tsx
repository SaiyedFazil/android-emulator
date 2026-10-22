import { cn } from "@/lib/utils";
import type { Plan, PlanId } from "@/types/admin.types";

/** Higher tiers read stronger: outline → tinted → solid teal. */
const PLAN_CLASS: Record<PlanId, string> = {
  free: "border-border text-muted-foreground",
  starter: "border-primary/30 text-primary",
  team: "border-primary/35 bg-primary/5 text-primary",
  business: "border-primary/40 bg-primary/10 text-primary",
  enterprise: "border-transparent bg-primary text-primary-foreground",
};

export function PlanBadge({ plan, className }: { plan: Plan; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        PLAN_CLASS[plan.id],
        className
      )}
    >
      {plan.name}
    </span>
  );
}
