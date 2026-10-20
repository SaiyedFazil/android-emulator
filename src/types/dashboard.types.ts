import type { EmulatorStatus } from "@/types/emulator.types";

export interface SessionPoint {
  label: string;
  sessions: number;
}

export interface ActivityItem {
  id: string;
  message: string;
  status: EmulatorStatus;
  /** ISO 8601 timestamp */
  at: string;
}

export interface ResourceMetric {
  label: "CPU" | "Memory" | "Storage";
  used: number;
  total: number;
  unit: string;
}

export type StatTone = EmulatorStatus | "neutral";
