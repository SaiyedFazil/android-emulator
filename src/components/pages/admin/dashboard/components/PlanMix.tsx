import { ChartCard } from "@/components/custom/ChartCard";
import type { Plan } from "@/types/admin.types";

/** Organizations per plan as labelled bars: one hue, length carries the number. */
export function PlanMix({ mix }: { mix: { plan: Plan; count: number }[] }) {
  const total = mix.reduce((sum, m) => sum + m.count, 0);
  const max = Math.max(1, ...mix.map((m) => m.count));

  return (
    <ChartCard
      title="Organizations by plan"
      description={
        <>
          <span className="font-mono text-foreground tabular">{total}</span> with a subscription
        </>
      }
      contentClassName="flex flex-col gap-4"
    >
      {mix.map(({ plan, count }) => (
        <div key={plan.id} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between text-[13px]">
            <span>
              {plan.name}
              <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">
                {plan.concurrentEmulators} emulator{plan.concurrentEmulators === 1 ? "" : "s"}
              </span>
            </span>
            <span className="font-mono text-muted-foreground tabular">
              {count}
              <span className="ml-1 text-[11px]">
                ({total ? Math.round((count / total) * 100) : 0}%)
              </span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </ChartCard>
  );
}
