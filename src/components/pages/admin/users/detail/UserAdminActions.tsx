"use client";

import { Ban, KeyRound, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Member } from "@/types/admin.types";

// TODO(api): each action calls the users API; for now they confirm.
export function UserAdminActions({ member }: { member: Member }) {
  const confirm = (message: string) => () => toast(message, { description: member.name });
  const suspended = member.status === "suspended";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin actions</CardTitle>
        <CardDescription>
          Changes apply immediately and are recorded in the audit log.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="justify-start"
          disabled={member.status === "invited"}
          onClick={confirm("Password reset email sent")}
        >
          <KeyRound />
          Reset password
        </Button>
        <Button
          variant="outline"
          className="justify-start"
          disabled={member.status === "invited"}
          onClick={confirm("Signed out of every device")}
        >
          <LogOut />
          Sign out everywhere
        </Button>
        <Button
          variant={suspended ? "outline" : "destructive"}
          className="justify-start"
          onClick={confirm(suspended ? "Reactivation requested" : "Suspension requested")}
        >
          <Ban />
          {suspended ? "Reactivate user" : "Suspend user"}
        </Button>

        <Separator className="my-1" />
        <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 p-3">
          <p className="text-sm font-medium text-destructive">Danger zone</p>
          <p className="text-xs text-muted-foreground">
            Deleting removes the user and their emulators. Their organization keeps its history.
          </p>
          <Button
            variant="destructive"
            size="sm"
            className="self-start"
            disabled={member.orgRole === "owner"}
            onClick={confirm("Deletion requested")}
          >
            <Trash2 />
            Delete user
          </Button>
          {member.orgRole === "owner" ? (
            <p className="text-xs text-muted-foreground">
              Transfer ownership of the organization before deleting its owner.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
