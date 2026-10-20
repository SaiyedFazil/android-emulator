"use client";

import { Download, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

// TODO(api): wire both actions once the backend exists.
export function DashboardActions() {
  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => toast("Export report", { description: "Coming soon" })}
      >
        <Download />
        Export report
      </Button>
      <Button size="lg" onClick={() => toast("New emulator", { description: "Coming soon" })}>
        <Plus />
        New emulator
      </Button>
    </>
  );
}
