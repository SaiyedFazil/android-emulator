import { minutesAgo } from "@/lib/sample-time";
import type { Host, HostStatus } from "@/types/admin.types";

type Row = [
  id: string,
  name: string,
  ip: string,
  region: string,
  status: HostStatus,
  cpu: number,
  memory: number,
  storage: number,
  slotsTotal: number,
  uptimeHours: number,
  heartbeatMinutesAgo: number,
];

// TODO(api): hosts and their health come from the backend. Slots in use are derived from the
// fleet emulators placed on each host (see admin.selectors).
// prettier-ignore
const ROWS: Row[] = [
  ["host_a1", "us-east-a1", "192.168.1.24", "US East", "healthy", 46, 58, 41, 20, 1420, 0],
  ["host_a2", "us-east-a2", "192.168.1.31", "US East", "healthy", 52, 61, 37, 20, 168, 0],
  ["host_b1", "eu-west-b1", "10.20.0.11", "EU West", "healthy", 63, 66, 52, 16, 2210, 0],
  ["host_b2", "eu-west-b2", "10.20.0.12", "EU West", "degraded", 81, 92, 74, 16, 25, 1],
  ["host_c1", "ap-south-c1", "10.40.0.21", "Asia South", "healthy", 71, 69, 48, 12, 940, 0],
  ["host_c2", "ap-south-c2", "10.40.0.22", "Asia South", "offline", 0, 0, 39, 12, 0, 40],
];

export const HOSTS: Host[] = ROWS.map(
  ([id, name, ip, region, status, cpu, memory, storage, slotsTotal, uptimeHours, heartbeat]) => ({
    id,
    name,
    ip,
    region,
    status,
    cpu,
    memory,
    storage,
    slotsTotal,
    uptimeHours,
    lastHeartbeatAt: minutesAgo(heartbeat),
  })
);
