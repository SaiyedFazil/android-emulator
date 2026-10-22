"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

// TODO(api): opens the plan picker and calls the subscriptions API.
export function ChangePlanButton({ name }: { name: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => toast("Change plan", { description: name })}>
      Change plan
    </Button>
  );
}
