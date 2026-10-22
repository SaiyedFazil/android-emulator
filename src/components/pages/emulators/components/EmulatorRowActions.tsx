"use client";

import { Link2, Play, RotateCw, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { RowActions } from "@/components/custom/RowActions";
import type { Emulator } from "@/types/emulator.types";

// TODO(api): each action calls the emulator control endpoint; for now they only confirm.
export function EmulatorRowActions({ emulator }: { emulator: Emulator }) {
  const { name, status } = emulator;
  const isUp = status === "running" || status === "booting";
  const request = (action: string) => () => toast(`${action} requested`, { description: name });

  return (
    <RowActions
      label={name}
      actions={[
        { label: "Start", icon: <Play />, disabled: isUp, onSelect: request("Start") },
        { label: "Stop", icon: <Square />, disabled: !isUp, onSelect: request("Stop") },
        {
          label: "Restart",
          icon: <RotateCw />,
          disabled: status === "offline",
          onSelect: request("Restart"),
        },
        {
          label: "Connect",
          icon: <Link2 />,
          disabled: status !== "running",
          onSelect: request("Connect"),
        },
        {
          label: "Delete",
          icon: <Trash2 />,
          destructive: true,
          separatorBefore: true,
          onSelect: request("Delete"),
        },
      ]}
    />
  );
}
