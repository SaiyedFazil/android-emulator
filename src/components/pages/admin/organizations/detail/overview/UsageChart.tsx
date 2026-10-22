"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/components/custom/ChartCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  inUse: { label: "Emulators in use", color: "var(--primary)" },
} satisfies ChartConfig;

const dayLabel = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", timeZone: "UTC" });

/** One series against the plan limit, drawn as a dashed reference line. */
export function UsageChart({
  data,
  limit,
  className,
}: {
  data: { day: string; inUse: number }[];
  limit: number;
  className?: string;
}) {
  const points = data.map((d) => ({
    ...d,
    label: dayLabel.format(new Date(`${d.day}T00:00:00Z`)),
  }));
  const top = Math.max(limit, ...data.map((d) => d.inUse));

  return (
    <ChartCard
      title="Concurrent emulators"
      description={`Daily peak over the last ${data.length} days · plan limit ${limit}`}
      className={className}
    >
      <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
        <AreaChart data={points} margin={{ top: 16, left: 0, right: 12 }}>
          <defs>
            <linearGradient id="usage-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-inUse)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--color-inUse)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 4" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={28}
            allowDecimals={false}
            domain={[0, Math.ceil(top * 1.1)]}
          />
          <ReferenceLine
            y={limit}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            label={{
              value: `Limit ${limit}`,
              position: "insideTopRight",
              fill: "var(--muted-foreground)",
              fontSize: 11,
            }}
          />
          <ChartTooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Area
            dataKey="inUse"
            type="monotone"
            stroke="var(--color-inUse)"
            strokeWidth={2}
            fill="url(#usage-fill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}
