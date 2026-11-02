"use client";

import * as React from "react";
import { toast } from "sonner";

import { TEAM_ROLE } from "@/components/pages/admin/constants/status.constants";
import { ACCESS_LEVELS } from "@/components/pages/admin/team/constants/access.constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TeamRole } from "@/types/admin.types";

// TODO(auth): sends the invite through the admin-team API.
export function InviteAdminSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [access, setAccess] = React.useState<TeamRole>("SUPPORT");
  const level = ACCESS_LEVELS.find((l) => l.role === access);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    toast.success("Invite sent", { description: `${email} · ${TEAM_ROLE[access].label}` });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <form onSubmit={onSubmit} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>Invite an admin</SheetTitle>
            <SheetDescription>
              They get an email to set a password and turn on 2FA.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="invite-email">Work email</Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                required
                autoComplete="off"
                placeholder="name@example.com"
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="invite-access">Access level</Label>
              <Select value={access} onValueChange={(v) => setAccess(v as TeamRole)}>
                <SelectTrigger id="invite-access" className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_LEVELS.filter((l) => l.role !== "OWNER").map((l) => (
                    <SelectItem key={l.role} value={l.role}>
                      {TEAM_ROLE[l.role].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {level ? <p className="text-xs text-muted-foreground">{level.summary}</p> : null}
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Send invite</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
