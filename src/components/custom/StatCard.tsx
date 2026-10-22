import { ArrowDown, ArrowUp } from "lucide-react";

import { STATUS_DOT_CLASS } from "@/components/custom/StatusBadge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatTone } from "@/types/dashboard.types";

interface StatCardProps {
  label: string;
  /** A count, an amount, or any rendered value. */
  value: React.ReactNode;
  hint?: string;
  /** Shown in a tile at the top right; replaces the tone dot. */
  icon?: React.ReactNode;
  tone?: StatTone;
  /** Change against a previous period; `invert` when a rise is bad (e.g. failed payments). */
  trend?: { percent: number; label?: string; invert?: boolean };
  className?: string;
}

export function StatCard({ label, value, hint, icon, tone, trend, className }: StatCardProps) {
  return (
    <Card className={cn("gap-2 px-4 py-4 sm:gap-2.5 sm:px-5 sm:py-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
          {!icon && tone ? (
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 rounded-full",
                tone === "neutral" ? "bg-muted-foreground" : STATUS_DOT_CLASS[tone]
              )}
            />
          ) : null}
          <span className="leading-snug">{label}</span>
        </div>
        {/* Two cards share a phone row: the label gets the space, the icon waits for `sm`. */}
        {icon ? (
          <span
            aria-hidden="true"
            className="hidden size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground sm:flex [&_svg]:size-4"
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <div className="font-mono text-2xl font-semibold tracking-tight tabular sm:text-3xl">
          {value}
        </div>
        {trend ? <TrendChip {...trend} /> : null}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

function TrendChip({ percent, label, invert }: NonNullable<StatCardProps["trend"]>) {
  const up = percent >= 0;
  const good = invert ? !up : up;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium tabular",
          good
            ? "bg-status-running-soft text-status-running-foreground"
            : "bg-status-offline-soft text-status-offline-foreground"
        )}
      >
        <Icon className="size-3" aria-hidden="true" />
        <span className="sr-only">{up ? "Up" : "Down"}</span>
        {Math.abs(percent)}%
      </span>
      {label}
    </span>
  );
}
