"use client";

import * as React from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";

// TODO(auth): both controls hand off to the identity provider.
export function SecurityCard({ passwordChangedAt }: { passwordChangedAt: string }) {
  const [twoFactor, setTwoFactor] = React.useState(false);

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
            <span className="text-xs text-muted-foreground">
              Changed {formatRelativeTime(passwordChangedAt, SAMPLE_NOW)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast("Change password", { description: "Available once sign-in is set up" })
            }
          >
            Change
          </Button>
        </div>
        <div className="flex items-center gap-3 pt-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <ShieldCheck className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <Label htmlFor="two-factor" className="text-sm font-medium">
              Two-factor authentication
            </Label>
            <span className="text-xs text-muted-foreground">
              {twoFactor ? "Enabled — codes required at sign-in" : "Add a second step at sign-in"}
            </span>
          </div>
          <Switch
            id="two-factor"
            checked={twoFactor}
            onCheckedChange={(on) => {
              setTwoFactor(on);
              toast.success(on ? "Two-factor enabled" : "Two-factor disabled");
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
