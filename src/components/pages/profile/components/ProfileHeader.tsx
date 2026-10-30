"use client";

import { CalendarDays, Mail, ShieldCheck } from "lucide-react";

import { roleLabel } from "@/components/pages/profile/utils/profile.utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-me";

const joined = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" });

export function ProfileHeader() {
  const { data: me } = useMe();

  return (
    <Card className="gap-0 py-0">
      {/* Graphite band, echoing the sidebar, with a faint grid texture. */}
      <div className="relative h-24 overflow-hidden bg-table-header">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(var(--table-header-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--table-header-foreground)_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.07]"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
      </div>
      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:gap-5 sm:px-6">
        <Avatar className="-mt-10 size-20 rounded-2xl ring-4 ring-card">
          <AvatarFallback className="rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground">
            {me ? `${me.firstName.charAt(0)}${me.lastName.charAt(0)}`.toUpperCase() : null}
          </AvatarFallback>
        </Avatar>
        {me ? (
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                {me.firstName} {me.lastName}
              </h1>
              <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
                <ShieldCheck />
                {roleLabel(me)}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5" aria-hidden="true" />
                {me.email}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                Joined {joined.format(new Date(me.createdAt))}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-2.5 sm:pt-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        )}
      </div>
    </Card>
  );
}
