import { STATUS_DOT_CLASS } from "@/components/custom/StatusBadge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatTone } from "@/types/dashboard.types";

interface StatCardProps {
  label: string;
  value: number;
  hint: string;
  tone: StatTone;
}

export function StatCard({ label, value, hint, tone }: StatCardProps) {
  return (
    <Card className="gap-2 px-4 py-4 sm:gap-2.5 sm:px-5 sm:py-5">
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <span
          aria-hidden="true"
          className={cn(
            "size-2 rounded-full",
            tone === "neutral" ? "bg-muted-foreground" : STATUS_DOT_CLASS[tone]
          )}
        />
        {label}
      </div>
      <div className="font-mono text-2xl font-semibold tracking-tight tabular sm:text-3xl">
        {value}
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Card>
  );
}
