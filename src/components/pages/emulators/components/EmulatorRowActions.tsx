"use client";

import { Link2, MoreHorizontal, Play, RotateCw, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Emulator } from "@/types/emulator.types";

// TODO(api): each action calls the emulator control endpoint; for now they only confirm.
export function EmulatorRowActions({ emulator }: { emulator: Emulator }) {
  const { name, status } = emulator;
  const isUp = status === "running" || status === "booting";
  const request = (action: string) => toast(`${action} requested`, { description: name });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${name}`}
          onClick={(event) => event.stopPropagation()}
          className="text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
          {name}
        </DropdownMenuLabel>
        <DropdownMenuItem disabled={isUp} onSelect={() => request("Start")}>
          <Play />
          Start
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!isUp} onSelect={() => request("Stop")}>
          <Square />
          Stop
        </DropdownMenuItem>
        <DropdownMenuItem disabled={status === "offline"} onSelect={() => request("Restart")}>
          <RotateCw />
          Restart
        </DropdownMenuItem>
        <DropdownMenuItem disabled={status !== "running"} onSelect={() => request("Connect")}>
          <Link2 />
          Connect
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => request("Delete")}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
