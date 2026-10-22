import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ChartCard } from "@/components/custom/ChartCard";
import { AUDIT_EVENTS } from "@/components/pages/admin/audit-log/constants/audit.constants";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";
import { cn } from "@/lib/utils";
import type { AuditEvent } from "@/types/admin.types";

const SEVERITY_DOT: Record<AuditEvent["severity"], string> = {
  info: "bg-status-stopped",
  warning: "bg-status-booting",
  critical: "bg-status-offline",
};

export function RecentActivity({ className }: { className?: string }) {
  return (
    <ChartCard
      title="Recent activity"
      description="Latest events across the platform"
      action={
        <Button variant="link" size="sm" asChild className="px-0">
          <Link href="/admin/audit-log">
            Audit log
            <ArrowRight />
          </Link>
        </Button>
      }
      className={className}
    >
      <ol className="flex flex-col gap-4">
        {AUDIT_EVENTS.slice(0, 6).map((event) => (
          <li key={event.id} className="flex gap-3">
            <span
              aria-hidden="true"
              className={cn("mt-1.5 size-2 shrink-0 rounded-full", SEVERITY_DOT[event.severity])}
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-sm">{event.action}</p>
              <p className="text-xs text-muted-foreground">
                {event.actor.name} · {formatRelativeTime(event.at, SAMPLE_NOW)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </ChartCard>
  );
}
