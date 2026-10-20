"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  SESSIONS_30D,
  SESSIONS_7D,
} from "@/components/pages/dashboard/constants/dashboard.constants";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const chartConfig = {
  sessions: { label: "Sessions", color: "var(--chart-2)" },
} satisfies ChartConfig;

type Range = "7d" | "30d";

export function SessionsChart({ className }: { className?: string }) {
  const [range, setRange] = React.useState<Range>("7d");
  const data = range === "7d" ? SESSIONS_7D : SESSIONS_30D;
  const peak = Math.max(...data.map((d) => d.sessions));
  const total = data.reduce((sum, d) => sum + d.sessions, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>
          Emulator boots per day ·{" "}
          <span className="font-mono text-foreground tabular">{total}</span> total
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(v) => v && setRange(v as Range)}
            aria-label="Time range"
            spacing={1}
            className="rounded-lg bg-muted p-1"
          >
            {(["7d", "30d"] as const).map((r) => (
              <ToggleGroupItem
                key={r}
                value={r}
                size="sm"
                className="px-2.5 text-xs text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-xs"
              >
                {r === "7d" ? "7 days" : "30 days"}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-55 w-full">
          <BarChart data={data} margin={{ top: 8, left: 0, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={range === "7d" ? 0 : 4}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={4} width={32} />
            <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent />} />
            <Bar dataKey="sessions" radius={[6, 6, 0, 0]} maxBarSize={44}>
              {data.map((d) => (
                <Cell
                  key={d.label}
                  fill={d.sessions === peak ? "var(--primary)" : "var(--color-sessions)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
