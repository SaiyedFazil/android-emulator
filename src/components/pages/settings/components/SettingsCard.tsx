"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface SettingsCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Hide the footer when every control applies immediately. */
  hideSave?: boolean;
}

export function SettingsCard({ title, description, children, hideSave }: SettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y">{children}</CardContent>
      {hideSave ? null : (
        <CardFooter className="justify-end border-t pt-4">
          {/* TODO(api): persist through the settings endpoint. */}
          <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
        </CardFooter>
      )}
    </Card>
  );
}

interface SettingRowProps {
  /** id of the control, so the label is announced with it. */
  htmlFor?: string;
  label: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingRow({ htmlFor, label, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="flex min-w-0 flex-col gap-0.5">
        {htmlFor ? (
          <Label htmlFor={htmlFor} className="text-sm font-medium">
            {label}
          </Label>
        ) : (
          <span className="text-sm font-medium">{label}</span>
        )}
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="shrink-0 sm:w-64 sm:has-[[role=switch]]:w-auto">{children}</div>
    </div>
  );
}
