import { minutesAgo } from "@/lib/sample-time";
import type { ActivityItem, ResourceMetric, SessionPoint } from "@/types/dashboard.types";

// TODO(api): replace the sample series below with the analytics endpoint.
export const SESSIONS_7D: SessionPoint[] = [
  { label: "Mon", sessions: 42 },
  { label: "Tue", sessions: 58 },
  { label: "Wed", sessions: 51 },
  { label: "Thu", sessions: 66 },
  { label: "Fri", sessions: 73 },
  { label: "Sat", sessions: 61 },
  { label: "Sun", sessions: 80 },
];

// prettier-ignore
const DAILY_30 = [
  38, 44, 41, 52, 47, 36, 33, 45, 50, 55, 49, 58, 42, 39, 51, 57, 60, 54, 63, 48, 44, 59, 62, 58,
  42, 58, 51, 66, 73, 61, 80,
].slice(-30);

export const SESSIONS_30D: SessionPoint[] = DAILY_30.map((sessions, i) => ({
  label: String(i + 1),
  sessions,
}));

// TODO(api): activity feed endpoint.
export const ACTIVITY: ActivityItem[] = [
  { id: "a1", message: "Pixel 8 Pro started", status: "running", at: minutesAgo(2) },
  { id: "a2", message: "Galaxy S24 is booting", status: "booting", at: minutesAgo(6) },
  { id: "a3", message: "Nexus 5X went offline", status: "offline", at: minutesAgo(18) },
  { id: "a4", message: "Pixel 6a stopped", status: "stopped", at: minutesAgo(64) },
  { id: "a5", message: "Pixel Tablet connected", status: "running", at: minutesAgo(120) },
];

// TODO(api): host metrics endpoint.
export const RESOURCES: ResourceMetric[] = [
  { label: "CPU", used: 68, total: 100, unit: "%" },
  { label: "Memory", used: 69, total: 128, unit: "GB" },
  { label: "Storage", used: 0.82, total: 2, unit: "TB" },
];
