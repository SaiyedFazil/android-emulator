"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/components/custom/ChartCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  count: { label: "New organizations", color: "var(--primary)" },
} satisfies ChartConfig;

export function NewOrganizationsChart({
  data,
  className,
}: {
  data: { month: string; count: number }[];
  className?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <ChartCard
      title="New organizations"
      description={
        <>
          <span className="font-mono text-foreground tabular">{total}</span> in the last 12 months
        </>
      }
      className={className}
    >
      <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
        <BarChart data={data} margin={{ top: 8, left: 0, right: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 4" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} interval={1} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={24}
            allowDecimals={false}
          />
          <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
