"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/components/custom/ChartCard";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";

// Two series → the validated series pair (teal, orange), with a legend so identity is never
// colour alone.
const chartConfig = {
  collected: { label: "Collected", color: "var(--series-1)" },
  refunded: { label: "Refunded", color: "var(--series-2)" },
} satisfies ChartConfig;

export function RevenueChart({
  data,
  className,
}: {
  data: { month: string; collected: number; refunded: number }[];
  className?: string;
}) {
  return (
    <ChartCard
      title="Collected vs refunded"
      description={`Paid and refunded invoices by issue month · last ${data.length} months`}
      className={className}
    >
      <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
        <BarChart data={data} margin={{ top: 8, left: 4, right: 4 }} barGap={2}>
          <CartesianGrid vertical={false} strokeDasharray="3 4" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={52}
            tickFormatter={(value: number) => formatCurrency(value * 100, { compact: true })}
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)" }}
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-[2px]"
                        style={{ background: `var(--color-${name})` }}
                      />
                      {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                    </span>
                    <span className="font-mono font-medium text-foreground tabular">
                      {formatCurrency(Math.round(Number(value) * 100))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <ChartLegend verticalAlign="top" content={<ChartLegendContent />} />
          <Bar
            dataKey="collected"
            fill="var(--color-collected)"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="refunded"
            fill="var(--color-refunded)"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
