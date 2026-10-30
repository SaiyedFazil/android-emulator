import { Monitor, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";
import type { SignInEvent } from "@/types/profile.types";

export function SignInActivity({
  events,
  title = "Devices",
  description = "Where your account has signed in recently.",
}: {
  events: SignInEvent[];
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col divide-y">
          {events.map((e) => {
            const Icon = e.kind === "mobile" ? Smartphone : Monitor;
            return (
              <li key={e.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{e.device}</span>
                    {e.current ? (
                      <Badge className="h-5 bg-status-running-soft px-1.5 text-[11px] text-status-running-foreground">
                        This device
                      </Badge>
                    ) : null}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {e.location} · <span className="font-mono">{e.ip}</span>
                  </span>
                </div>
                <time
                  dateTime={e.at}
                  title={formatDateTime(e.at)}
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  {formatRelativeTime(e.at, SAMPLE_NOW)}
                </time>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
