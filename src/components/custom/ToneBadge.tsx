import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/types/badge.types";

const TONE_CLASS: Record<BadgeTone, string> = {
  success: "bg-status-running-soft text-status-running-foreground",
  warning: "bg-status-booting-soft text-status-booting-foreground",
  danger: "bg-status-offline-soft text-status-offline-foreground",
  neutral: "bg-status-stopped-soft text-status-stopped-foreground",
  info: "bg-accent text-accent-foreground",
};

interface ToneBadgeProps {
  tone: BadgeTone;
  label: string;
  /** Pulse the dot for in-progress states. */
  pulse?: boolean;
  /** Hide the dot for role-style labels. */
  dot?: boolean;
  className?: string;
}

/** A status pill — the colour always comes with a text label. */
export function ToneBadge({ tone, label, pulse, dot = true, className }: ToneBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASS[tone],
        className
      )}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full bg-current",
            pulse && "animate-pulse motion-reduce:animate-none"
          )}
        />
      ) : null}
      {label}
    </span>
  );
}
