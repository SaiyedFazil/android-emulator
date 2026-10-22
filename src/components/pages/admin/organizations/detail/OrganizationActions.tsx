"use client";

import { Ban, Copy, Layers, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// TODO(api): plan changes, suspension and deletion call the admin API.
export function OrganizationActions({
  id,
  name,
  suspended,
}: {
  id: string;
  name: string;
  suspended: boolean;
}) {
  const confirm = (message: string) => () => toast(message, { description: name });

  return (
    <>
      <Button variant="outline" size="lg" onClick={confirm("Change plan")}>
        <Layers />
        Change plan
      </Button>
      <Button
        variant={suspended ? "outline" : "destructive"}
        size="lg"
        onClick={confirm(suspended ? "Reactivation requested" : "Suspension requested")}
      >
        <Ban />
        {suspended ? "Reactivate" : "Suspend"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-lg" aria-label={`More actions for ${name}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onSelect={() => {
              void navigator.clipboard?.writeText(id);
              toast("Organization ID copied", { description: id });
            }}
          >
            <Copy />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={confirm("Deletion requested")}>
            <Trash2 />
            Delete organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
