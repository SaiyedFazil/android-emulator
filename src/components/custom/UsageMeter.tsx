import { usageLevel, type UsageLevel } from "@/lib/usage";
import { cn } from "@/lib/utils";

const BAR_CLASS: Record<UsageLevel, string> = {
  ok: "bg-primary",
  high: "bg-status-booting",
  full: "bg-status-offline",
  over: "bg-status-offline",
};

interface UsageMeterProps {
  used: number;
  limit: number;
  /** Shown above the bar; also the meter's accessible name. */
  label?: string;
  /** `percent` reads "46%" (limit should be 100); `count` reads "3 / 10". */
  unit?: "count" | "percent";
  size?: "sm" | "md";
  className?: string;
}

/** A used-of-limit bar: amber from 80 %, red when full, and "Over limit" past it. */
export function UsageMeter({
  used,
  limit,
  label,
  unit = "count",
  size = "md",
  className,
}: UsageMeterProps) {
  const { fraction, level } = usageLevel(used, limit);
  const over = level === "over";
  const reading = unit === "percent" ? `${used}%` : `${used} / ${limit}`;

  return (
    <div className={cn("flex min-w-0 flex-col", size === "sm" ? "gap-1" : "gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        {label ? <span className="truncate text-muted-foreground">{label}</span> : null}
        <span className="flex shrink-0 items-baseline gap-1.5">
          <span className="font-mono text-foreground tabular">{reading}</span>
          {over ? (
            <span className="font-medium text-status-offline-foreground">Over limit</span>
          ) : null}
        </span>
      </div>
      <div
        role="meter"
        aria-label={label ?? "Usage"}
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuetext={`${reading}${over ? ", over limit" : ""}`}
        className={cn("overflow-hidden rounded-full bg-muted", size === "sm" ? "h-1.5" : "h-2")}
      >
        <div
          className={cn("h-full rounded-full", BAR_CLASS[level])}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
    </div>
  );
}
