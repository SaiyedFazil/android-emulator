"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied", { description: address });
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy the address");
    }
  };

  return (
    <span className="group/address inline-flex max-w-full items-center gap-1">
      <span className="max-w-45 truncate font-mono text-xs text-foreground/80" title={address}>
        {address}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={`Copy address ${address}`}
        onClick={copy}
        className="text-muted-foreground opacity-60 group-hover/address:opacity-100 focus-visible:opacity-100"
      >
        {copied ? <Check className="text-status-running" /> : <Copy />}
      </Button>
    </span>
  );
}
