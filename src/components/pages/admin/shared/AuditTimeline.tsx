import Link from "next/link";
import { ScrollText } from "lucide-react";

import { EmptyState } from "@/components/custom/EmptyState";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";
import { cn } from "@/lib/utils";
import type { AuditEvent } from "@/types/admin.types";

const SEVERITY_DOT: Record<AuditEvent["severity"], string> = {
  info: "bg-status-stopped",
  warning: "bg-status-booting",
  critical: "bg-status-offline",
};

/** The action sentence, with its target linked in place when the sentence names it. */
export function ActionText({ event }: { event: AuditEvent }) {
  const { action, target } = event;
  if (!target) return action;
  const link = (
    <Link href={target.href} className="text-primary hover:underline">
      {target.label}
    </Link>
  );
  const at = action.indexOf(target.label);
  if (at === -1) {
    return (
      <>
        {action} · {link}
      </>
    );
  }
  return (
    <>
      {action.slice(0, at)}
      {link}
      {action.slice(at + target.label.length)}
    </>
  );
}

/** Audit events as a vertical timeline, newest first. */
export function AuditTimeline({
  events,
  emptyTitle = "No activity yet",
}: {
  events: AuditEvent[];
  emptyTitle?: string;
}) {
  if (events.length === 0) {
    return <EmptyState icon={<ScrollText />} title={emptyTitle} className="py-8" />;
  }

  return (
    <ol className="relative flex flex-col gap-5 before:absolute before:top-2 before:bottom-2 before:left-0.75 before:w-px before:bg-border">
      {events.map((event) => (
        <li key={event.id} className="relative flex gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "relative mt-1.5 size-1.75 shrink-0 rounded-full ring-4 ring-card",
              SEVERITY_DOT[event.severity]
            )}
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-sm">
              <ActionText event={event} />
            </p>
            <p className="text-xs text-muted-foreground">
              {event.actor.name} ·{" "}
              <time dateTime={event.at} title={formatDateTime(event.at)}>
                {formatRelativeTime(event.at, SAMPLE_NOW)}
              </time>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
