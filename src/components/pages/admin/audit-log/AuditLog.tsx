"use client";

import * as React from "react";
import { Download, Info, OctagonAlert, SearchX, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/custom/EmptyState";
import { FilterChips } from "@/components/custom/FilterChips";
import { PageHeader } from "@/components/custom/PageHeader";
import { SearchField } from "@/components/custom/SearchField";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { AUDIT_EVENTS } from "@/components/pages/admin/audit-log/constants/audit.constants";
import { ActionText } from "@/components/pages/admin/shared/AuditTimeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";
import { cn } from "@/lib/utils";
import type { AuditCategory, AuditEvent } from "@/types/admin.types";

type ActorFilter = "all" | AuditEvent["actor"]["kind"];
type CategoryFilter = "all" | AuditCategory;
type Period = "all" | "24h" | "7d" | "30d";

const ACTOR_LABEL: Record<ActorFilter, string> = {
  all: "All",
  admin: "Admins",
  user: "Users",
  system: "System",
};
const CATEGORY_LABEL: Record<AuditCategory, string> = {
  auth: "Auth",
  billing: "Billing",
  organizations: "Organizations",
  users: "Users",
  infrastructure: "Infrastructure",
  settings: "Settings",
};
const PERIOD_HOURS: Record<Exclude<Period, "all">, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};
const PERIOD_LABEL: Record<Period, string> = {
  all: "All time",
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};
const SEVERITY = {
  info: { icon: <Info />, className: "bg-status-stopped-soft text-status-stopped-foreground" },
  warning: {
    icon: <TriangleAlert />,
    className: "bg-status-booting-soft text-status-booting-foreground",
  },
  critical: {
    icon: <OctagonAlert />,
    className: "bg-status-offline-soft text-status-offline-foreground",
  },
};

const hoursAgo = (iso: string) => (SAMPLE_NOW.getTime() - new Date(iso).getTime()) / 3_600_000;

export function AuditLog() {
  const [query, setQuery] = React.useState("");
  const [actor, setActor] = React.useState<ActorFilter>("all");
  const [category, setCategory] = React.useState<CategoryFilter>("all");
  const [period, setPeriod] = React.useState<Period>("all");

  const actorCounts = React.useMemo(() => {
    const counts = { all: AUDIT_EVENTS.length, admin: 0, user: 0, system: 0 };
    for (const event of AUDIT_EVENTS) counts[event.actor.kind] += 1;
    return counts;
  }, []);
  const events = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return AUDIT_EVENTS.filter(
      (e) =>
        (actor === "all" || e.actor.kind === actor) &&
        (category === "all" || e.category === category) &&
        (period === "all" || hoursAgo(e.at) <= PERIOD_HOURS[period]) &&
        (!q ||
          [e.action, e.actor.name, e.target?.label ?? "", e.ip ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(q))
    );
  }, [query, actor, category, period]);

  const clearFilters = () => {
    setQuery("");
    setActor("all");
    setCategory("all");
    setPeriod("all");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit log"
        description="Who did what, and when — admins, members and the platform itself."
        actions={
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              toast("Export started", { description: `${events.length} events as CSV` })
            }
          >
            <Download />
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
          <SearchField
            value={query}
            onChange={setQuery}
            label="Search the audit log"
            placeholder="Search actions, people or IPs…"
          />
          <Select value={category} onValueChange={(v) => setCategory(v as CategoryFilter)}>
            <SelectTrigger aria-label="Filter by category" className="h-9 w-full bg-card sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(Object.keys(CATEGORY_LABEL) as AuditCategory[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {CATEGORY_LABEL[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger aria-label="Filter by period" className="h-9 w-full bg-card sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PERIOD_LABEL) as Period[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {PERIOD_LABEL[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <FilterChips
          value={actor}
          onChange={setActor}
          label="Filter by actor"
          options={(Object.keys(ACTOR_LABEL) as ActorFilter[]).map((key) => ({
            value: key,
            label: ACTOR_LABEL[key],
            count: actorCounts[key],
          }))}
        />
      </div>

      <Card className="gap-0 py-0">
        <div className="hidden grid-cols-[minmax(0,1fr)_170px_130px_130px_110px] gap-4 border-b bg-table-header px-5 py-3 text-[13px] font-medium text-table-header-foreground md:grid">
          <span>Event</span>
          <span>Actor</span>
          <span>Category</span>
          <span>IP address</span>
          <span className="text-right">When</span>
        </div>
        {events.length === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title="No events match"
            description="Try a different search, category, actor or period."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <ol className="divide-y">
            {events.map((event) => (
              <li
                key={event.id}
                className="grid gap-x-4 gap-y-1.5 px-5 py-3.5 transition-colors hover:bg-row-hover md:grid-cols-[minmax(0,1fr)_170px_130px_130px_110px] md:items-center"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-px flex size-7 shrink-0 items-center justify-center rounded-md [&_svg]:size-3.5",
                      SEVERITY[event.severity].className
                    )}
                  >
                    {SEVERITY[event.severity].icon}
                    <span className="sr-only">{event.severity}</span>
                  </span>
                  <div className="flex min-w-0 flex-col gap-1 pt-0.5">
                    <p className="text-sm">
                      <ActionText event={event} />
                    </p>
                    {/* Phones get one meta line instead of four stacked columns. */}
                    <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground md:hidden">
                      <span>{event.actor.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{CATEGORY_LABEL[event.category]}</span>
                      <span aria-hidden="true">·</span>
                      <time dateTime={event.at}>{formatRelativeTime(event.at, SAMPLE_NOW)}</time>
                    </p>
                  </div>
                </div>
                <div className="hidden min-w-0 flex-col text-sm md:flex">
                  <span className="truncate">{event.actor.name}</span>
                  {/* "System" already says what it is. */}
                  {event.actor.kind !== "system" ? (
                    <span className="text-xs text-muted-foreground capitalize">
                      {event.actor.kind}
                    </span>
                  ) : null}
                </div>
                <div className="hidden md:block">
                  <ToneBadge tone="neutral" label={CATEGORY_LABEL[event.category]} dot={false} />
                </div>
                <span className="hidden font-mono text-xs text-muted-foreground md:block">
                  {event.ip ?? "—"}
                </span>
                <time
                  dateTime={event.at}
                  title={formatDateTime(event.at)}
                  className="hidden text-right text-xs whitespace-nowrap text-muted-foreground md:block"
                >
                  {formatRelativeTime(event.at, SAMPLE_NOW)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </Card>
      <p className="text-xs text-muted-foreground">
        Showing {events.length} of {AUDIT_EVENTS.length} events · times in UTC on hover.
      </p>
    </div>
  );
}
