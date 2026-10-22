"use client";

import { Plus, RotateCw, Wrench } from "lucide-react";
import { toast } from "sonner";

import { RowActions } from "@/components/custom/RowActions";
import { Button } from "@/components/ui/button";

// TODO(api): host operations call the infrastructure API; for now they confirm.
export function HostActions({ name, offline }: { name: string; offline: boolean }) {
  const confirm = (message: string) => () => toast(message, { description: name });
  return (
    <RowActions
      label={name}
      actions={[
        {
          label: "Restart host",
          icon: <RotateCw />,
          disabled: offline,
          onSelect: confirm("Restart requested"),
        },
        {
          label: "Put in maintenance",
          icon: <Wrench />,
          onSelect: confirm("Maintenance scheduled"),
        },
      ]}
    />
  );
}

export function AddHostButton() {
  return (
    <Button size="lg" onClick={() => toast("Add host", { description: "Coming soon" })}>
      <Plus />
      Add host
    </Button>
  );
}
