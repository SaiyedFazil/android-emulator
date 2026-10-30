"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { ChangePasswordSheet } from "@/components/pages/profile/components/ChangePasswordSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-me";
import { useNow } from "@/hooks/use-now";
import { getApiError } from "@/lib/api/api-error";
import { meApi } from "@/lib/api/me/me-api";
import { formatDateTime, formatRelativeTime } from "@/lib/format";

export function SecurityCard() {
  const { data: me } = useMe();
  const now = useNow();
  const [changing, setChanging] = React.useState(false);

  const resetEmail = useMutation({
    mutationFn: async () => (await meApi.sendResetEmail()).data,
    onSuccess: () => toast.success("Reset link sent", { description: "Check your inbox." }),
    onError: (error) => toast.error(getApiError(error).message),
  });

  const changedAt = me?.passwordChangedAt;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password & security</CardTitle>
        <CardDescription>Keep your account protected.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y">
        <div className="flex items-center gap-3 pb-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <KeyRound className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium">Password</span>
            {me && now ? (
              <span className="text-xs text-muted-foreground">
                {changedAt ? (
                  <time dateTime={changedAt} title={formatDateTime(changedAt)}>
                    Changed {formatRelativeTime(changedAt, now)}
                  </time>
                ) : (
                  "Never changed"
                )}
              </span>
            ) : (
              <Skeleton className="mt-1 h-3 w-28" />
            )}
          </div>
          <Button variant="outline" size="sm" disabled={!me} onClick={() => setChanging(true)}>
            Change
          </Button>
        </div>
        <div className="flex items-center gap-3 pt-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <MailCheck className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium">Reset by email</span>
            <span className="text-xs text-muted-foreground">
              Forgot your current password? We&apos;ll email you a link to set a new one.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!me || resetEmail.isPending}
            onClick={() => resetEmail.mutate()}
          >
            {resetEmail.isPending ? "Sending…" : "Email me a link"}
          </Button>
        </div>
      </CardContent>
      <ChangePasswordSheet open={changing} onOpenChange={setChanging} />
    </Card>
  );
}
