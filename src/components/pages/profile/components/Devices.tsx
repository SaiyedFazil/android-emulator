"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Monitor, RotateCw, Smartphone, Tablet } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LocalTime } from "@/components/custom/LocalTime";
import { useNow } from "@/hooks/use-now";
import { getApiError } from "@/lib/api/api-error";
import { authApi } from "@/lib/api/auth/auth-api";
import { signOutOfApp } from "@/lib/auth/sign-out";
import { LOGIN_PATH } from "@/lib/auth/roles";
import { signOutTo } from "@/lib/axios";
import type { Dayjs } from "@/lib/dayjs";
import { formatRelativeTime } from "@/lib/format";
import type { ApiSession, DeviceType } from "@/types/auth.types";

export const SESSIONS_QUERY_KEY = ["sessions"] as const;

const DEVICE_ICONS: Record<DeviceType, typeof Monitor> = {
  DESKTOP: Monitor,
  MOBILE: Smartphone,
  TABLET: Tablet,
};

function DeviceRow({
  session,
  now,
  busy,
  onSignOut,
}: {
  session: ApiSession;
  now: Dayjs | null;
  busy: boolean;
  onSignOut: () => void;
}) {
  const Icon = DEVICE_ICONS[session.deviceType ?? "DESKTOP"];

  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="truncate">{session.deviceName ?? "Unknown device"}</span>
          {session.isCurrent ? (
            <Badge className="h-5 bg-status-running-soft px-1.5 text-[11px] text-status-running-foreground">
              This device
            </Badge>
          ) : null}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {session.location ?? "Unknown location"}
          {session.ipAddress ? (
            <>
              {" · "}
              <span className="font-mono">{session.ipAddress}</span>
            </>
          ) : null}
          {now ? (
            <>
              {" · "}
              <LocalTime value={session.lastUsedAt}>
                Active {formatRelativeTime(session.lastUsedAt, now)}
              </LocalTime>
            </>
          ) : null}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        disabled={busy}
        onClick={onSignOut}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <LogOut />
        Sign out
      </Button>
    </li>
  );
}

/** Where the user is signed in, with a way to end each session. */
export function Devices() {
  const queryClient = useQueryClient();
  const now = useNow();
  const sessions = useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: async () => (await authApi.getSessions()).data,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
  const showError = (error: unknown) => toast.error(getApiError(error).message);

  const revokeOne = useMutation({
    mutationFn: (session: ApiSession) =>
      session.isCurrent ? signOutOfApp() : authApi.revokeSession(session.uuid),
    onSuccess: (_, session) => {
      if (session.isCurrent) return;
      toast.success("Device signed out");
      void refresh();
    },
    onError: showError,
  });

  const revokeOthers = useMutation({
    mutationFn: async () => (await authApi.revokeOtherSessions()).data,
    onSuccess: ({ revoked }) => {
      toast.success(
        revoked === 1 ? "Signed out 1 other device" : `Signed out ${revoked} other devices`
      );
      void refresh();
    },
    onError: showError,
  });

  const signOutEverywhere = useMutation({
    mutationFn: async () => {
      await authApi.logoutAll();
      await signOutTo(LOGIN_PATH);
    },
    onError: showError,
  });

  const busy = revokeOne.isPending || revokeOthers.isPending || signOutEverywhere.isPending;
  const others = sessions.data?.filter((session) => !session.isCurrent).length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices</CardTitle>
        <CardDescription>Where your account is signed in right now.</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.isPending ? (
          <ul className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-56 max-w-full" />
                </div>
              </li>
            ))}
          </ul>
        ) : sessions.isError ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-destructive">{getApiError(sessions.error).message}</p>
            <Button variant="outline" size="sm" onClick={() => void sessions.refetch()}>
              <RotateCw />
              Try again
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col divide-y">
            {sessions.data.map((session) => (
              <DeviceRow
                key={session.uuid}
                session={session}
                now={now}
                busy={busy}
                onSignOut={() => revokeOne.mutate(session)}
              />
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex-wrap justify-end gap-2 border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={busy || others === 0}
          onClick={() => revokeOthers.mutate()}
        >
          Sign out other devices
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || !sessions.data}
          onClick={() => signOutEverywhere.mutate()}
          className="text-destructive hover:text-destructive"
        >
          Sign out everywhere
        </Button>
      </CardFooter>
    </Card>
  );
}
