import Link from "next/link";
import { ShieldCheck, ShieldOff } from "lucide-react";

import { EntityAvatar } from "@/components/custom/EntityAvatar";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";
import type { Member } from "@/types/admin.types";

/* Table cells shared by the organization Users tab and the global Users list. */

export function PersonCell({ member }: { member: Member }) {
  return (
    <Link
      href={`/admin/users/${member.id}`}
      className="group flex max-w-[280px] min-w-0 items-center gap-3 outline-none"
    >
      <EntityAvatar name={member.name} size="sm" />
      <span className="flex min-w-0 flex-col">
        <span
          className="truncate font-medium group-hover:underline group-focus-visible:underline"
          title={member.name}
        >
          {member.name}
        </span>
        <span
          className="truncate text-xs text-muted-foreground [[data-card-header]_&]:text-current [[data-card-header]_&]:opacity-75"
          title={member.email}
        >
          {member.email}
        </span>
      </span>
    </Link>
  );
}

export function RunningCell({ running }: { running: number }) {
  if (running === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-status-running" />
      <span className="font-mono tabular">{running}</span> running
    </span>
  );
}

export function LastActiveCell({ at }: { at: string | null }) {
  if (!at) return <span className="text-muted-foreground">Never</span>;
  return (
    <time
      dateTime={at}
      title={formatDateTime(at)}
      className="whitespace-nowrap text-muted-foreground"
    >
      {formatRelativeTime(at, SAMPLE_NOW)}
    </time>
  );
}

export function TwoFactorCell({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <span className="inline-flex items-center gap-1.5 text-status-running-foreground">
      <ShieldCheck className="size-4" aria-hidden="true" />
      On
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <ShieldOff className="size-4" aria-hidden="true" />
      Off
    </span>
  );
}
