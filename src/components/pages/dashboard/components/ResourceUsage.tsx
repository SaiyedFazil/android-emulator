import { RESOURCES } from "@/components/pages/dashboard/constants/dashboard.constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ResourceUsage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Host resources</CardTitle>
        <CardDescription>Combined across all hosts</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {RESOURCES.map((r) => {
          const pct = Math.round((r.used / r.total) * 100);
          return (
            <div key={r.label} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between text-[13px]">
                <span>{r.label}</span>
                <span className="font-mono text-xs text-muted-foreground tabular">
                  {r.unit === "%" ? `${pct}%` : `${r.used} / ${r.total} ${r.unit}`}
                </span>
              </div>
              <Progress
                value={pct}
                aria-label={`${r.label} usage`}
                className={cn(
                  "h-2",
                  pct >= 80 && "*:data-[slot=progress-indicator]:bg-status-booting"
                )}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
