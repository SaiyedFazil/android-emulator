import { cn } from "@/lib/utils";
import type { EmulatorStatus } from "@/types/emulator.types";

export const EMULATOR_STATUS: Record<EmulatorStatus, { label: string }> = {
  running: { label: "Running" },
  booting: { label: "Booting" },
  stopped: { label: "Stopped" },
  offline: { label: "Offline" },
};

const STATUS_CLASS: Record<EmulatorStatus, string> = {
  running: "bg-status-running-soft text-status-running-foreground",
  booting: "bg-status-booting-soft text-status-booting-foreground",
  stopped: "bg-status-stopped-soft text-status-stopped-foreground",
  offline: "bg-status-offline-soft text-status-offline-foreground",
};

export const STATUS_DOT_CLASS: Record<EmulatorStatus, string> = {
  running: "bg-status-running",
  booting: "bg-status-booting",
  stopped: "bg-status-stopped",
  offline: "bg-status-offline",
};

interface StatusBadgeProps {
  status: EmulatorStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_CLASS[status],
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full bg-current",
          status === "booting" && "animate-pulse motion-reduce:animate-none"
        )}
      />
      {EMULATOR_STATUS[status].label}
    </span>
  );
}
