import { STATUS_DOT_CLASS } from "@/components/custom/StatusBadge";
import { ACTIVITY } from "@/components/pages/dashboard/constants/dashboard.constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";
import { cn } from "@/lib/utils";

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative flex flex-col gap-4">
          {/* Timeline rail */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[3.5px] w-px bg-border"
          />
          {ACTIVITY.map((item) => (
            <li key={item.id} className="relative flex gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full ring-4 ring-card",
                  STATUS_DOT_CLASS[item.status]
                )}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px]">{item.message}</span>
                <time
                  dateTime={item.at}
                  title={formatDateTime(item.at)}
                  className="text-xs text-muted-foreground"
                >
                  {formatRelativeTime(item.at, SAMPLE_NOW)}
                </time>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
