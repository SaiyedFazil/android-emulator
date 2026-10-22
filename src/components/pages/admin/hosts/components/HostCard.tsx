import { Activity, MapPin } from "lucide-react";

import { ToneBadge } from "@/components/custom/ToneBadge";
import { UsageMeter } from "@/components/custom/UsageMeter";
import { HOST_STATUS } from "@/components/pages/admin/constants/status.constants";
import { HostActions } from "@/components/pages/admin/hosts/components/HostActions";
import { hostSlotsUsed } from "@/components/pages/admin/utils/admin.selectors";
import { Card } from "@/components/ui/card";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";
import { cn } from "@/lib/utils";
import type { Host } from "@/types/admin.types";

function formatUptime(hours: number): string {
  if (hours === 0) return "—";
  return hours >= 48 ? `${Math.floor(hours / 24)} days` : `${hours} hours`;
}

export function HostCard({ host }: { host: Host }) {
  const status = HOST_STATUS[host.status];
  const offline = host.status === "offline";

  return (
    <Card className="gap-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-mono text-base font-semibold">{host.name}</h2>
            <ToneBadge tone={status.tone} label={status.label} pulse={host.status === "degraded"} />
          </div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="font-mono">{host.ip}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" aria-hidden="true" />
              {host.region}
            </span>
          </p>
        </div>
        <HostActions name={host.name} offline={offline} />
      </div>

      {/* An unreachable host's last readings are stale: shown, but dimmed. */}
      <div className={cn("flex flex-col gap-3", offline && "opacity-50")}>
        <UsageMeter used={host.cpu} limit={100} unit="percent" label="CPU" size="sm" />
        <UsageMeter used={host.memory} limit={100} unit="percent" label="Memory" size="sm" />
        <UsageMeter used={host.storage} limit={100} unit="percent" label="Storage" size="sm" />
      </div>

      <UsageMeter used={hostSlotsUsed(host.id)} limit={host.slotsTotal} label="Emulator slots" />

      <dl className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Uptime</dt>
          <dd className="font-medium">{formatUptime(host.uptimeHours)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="size-3" aria-hidden="true" />
            Last heartbeat
          </dt>
          <dd className={cn("font-medium", offline && "text-status-offline-foreground")}>
            <time dateTime={host.lastHeartbeatAt} title={formatDateTime(host.lastHeartbeatAt)}>
              {formatRelativeTime(host.lastHeartbeatAt, SAMPLE_NOW)}
            </time>
          </dd>
        </div>
      </dl>
    </Card>
  );
}
