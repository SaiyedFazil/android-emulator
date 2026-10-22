"use client";

import { Download, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

// TODO(api): export builds a report; "New organization" opens the create flow.
export function AdminDashboardActions() {
  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => toast("Report export started", { description: "Coming soon" })}
      >
        <Download />
        Export report
      </Button>
      <Button size="lg" onClick={() => toast("New organization", { description: "Coming soon" })}>
        <Plus />
        New organization
      </Button>
    </>
  );
}
