"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/components/custom/ChartCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";

const chartConfig = { mrr: { label: "MRR", color: "var(--primary)" } } satisfies ChartConfig;

interface MrrChartProps {
  data: { month: string; mrr: number }[];
  /** Today's MRR in cents and its month-over-month change. */
  current: number;
  growth: number;
  className?: string;
}

/** One series, so no legend: the title names it. Hover shows each month's value. */
export function MrrChart({ data, current, growth, className }: MrrChartProps) {
  return (
    <ChartCard
      title="Monthly recurring revenue"
      description={
        <>
          <span className="font-mono text-foreground tabular">{formatCurrency(current)}</span> now ·{" "}
          {growth >= 0 ? "+" : ""}
          {growth}% on last month
        </>
      }
      className={className}
    >
      <ChartContainer config={chartConfig} className="aspect-auto h-60 w-full">
        <AreaChart data={data} margin={{ top: 8, left: 4, right: 8 }}>
          <defs>
            <linearGradient id="mrr-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-mrr)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--color-mrr)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 4" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={48}
            tickFormatter={(value: number) => formatCurrency(value * 100, { compact: true })}
          />
          <ChartTooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            content={
              <ChartTooltipContent
                indicator="line"
                formatter={(value) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">MRR</span>
                    <span className="font-mono font-medium text-foreground tabular">
                      {formatCurrency(Math.round(Number(value) * 100))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Area
            dataKey="mrr"
            type="monotone"
            stroke="var(--color-mrr)"
            strokeWidth={2}
            fill="url(#mrr-fill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}
