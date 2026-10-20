import { minutesAgo } from "@/lib/sample-time";
import type { Emulator, EmulatorStatus } from "@/types/emulator.types";

type Row = [
  name: string,
  model: string,
  android: string,
  api: number,
  status: EmulatorStatus,
  host: string,
  port: number,
  cpu: number,
  ram: number,
  activeMinutesAgo: number,
];

const H1 = "192.168.1.24";
const H2 = "192.168.1.31";
const H3 = "192.168.1.40";

// prettier-ignore
const ROWS: Row[] = [
  ["Pixel 8 Pro", "Pixel 8 Pro", "15", 35, "running", H1, 5554, 4, 8, 2],
  ["Galaxy S24", "Galaxy S24", "14", 34, "booting", H1, 5556, 4, 8, 6],
  ["Pixel Tablet", "Pixel Tablet", "14", 34, "running", H2, 5558, 6, 8, 12],
  ["Pixel 6a", "Pixel 6a", "13", 33, "stopped", H2, 5560, 2, 4, 64],
  ["Nexus 5X", "Nexus 5X", "12", 31, "offline", H3, 5562, 2, 2, 18],
  ["Pixel 9", "Pixel 9", "15", 35, "running", H1, 5564, 4, 8, 3],
  ["Pixel 9 Pro Fold", "Pixel 9 Pro Fold", "15", 35, "running", H1, 5566, 6, 12, 5],
  ["Galaxy A55", "Galaxy A55", "14", 34, "running", H2, 5568, 4, 6, 9],
  ["Pixel 7", "Pixel 7", "14", 34, "stopped", H2, 5570, 4, 6, 140],
  ["Pixel 8a", "Pixel 8a", "15", 35, "running", H3, 5572, 4, 8, 1],
  ["Galaxy Tab S9", "Galaxy Tab S9", "14", 34, "running", H3, 5574, 6, 8, 22],
  ["OnePlus 12", "OnePlus 12", "14", 34, "stopped", H1, 5576, 4, 8, 300],
  ["Pixel 5", "Pixel 5", "12", 31, "offline", H3, 5578, 2, 4, 42],
  ["Pixel 8 — nightly regression suite runner (CI)", "Pixel 8", "15", 35, "running", H1, 5580, 4, 8, 4],
  ["Xiaomi 14", "Xiaomi 14", "14", 34, "running", "2001:0db8:85a3:0000:0000:8a2e:0370:7334", 5582, 4, 8, 16],
  ["Pixel 7 Pro", "Pixel 7 Pro", "13", 33, "stopped", H2, 5584, 4, 6, 1440],
  ["Galaxy S23", "Galaxy S23", "13", 33, "running", H2, 5586, 4, 6, 30],
  ["Pixel Fold", "Pixel Fold", "14", 34, "booting", H2, 5588, 6, 12, 1],
  ["Pixel 4a", "Pixel 4a", "12", 31, "stopped", H3, 5590, 2, 4, 2880],
  ["Nothing Phone (2)", "Nothing Phone (2)", "14", 34, "running", H1, 5592, 4, 8, 7],
  ["Pixel 9 Pro", "Pixel 9 Pro", "15", 35, "running", H1, 5594, 6, 12, 11],
  ["Galaxy S22", "Galaxy S22", "13", 33, "offline", H3, 5596, 4, 6, 95],
  ["Pixel 6", "Pixel 6", "13", 33, "stopped", H2, 5598, 4, 6, 600],
  ["Moto G Power", "Moto G Power", "13", 33, "running", H3, 5600, 2, 4, 26],
  ["Pixel 8", "Pixel 8", "14", 34, "stopped", H1, 5602, 4, 8, 4320],
  ["Android TV 1080p", "Android TV", "14", 34, "running", H2, 5604, 2, 4, 50],
];

// TODO(api): replace with the emulator list endpoint.
export const EMULATORS: Emulator[] = ROWS.map(
  ([name, model, androidVersion, apiLevel, status, host, port, cpuCores, ramGb, ago], i) => ({
    id: `emu-${String(i + 1).padStart(3, "0")}`,
    name,
    serial: `emulator-${port}`,
    model,
    androidVersion,
    apiLevel,
    status,
    host,
    port,
    cpuCores,
    ramGb,
    lastActive: minutesAgo(ago),
  })
);

export const STATUS_FILTERS = ["all", "running", "booting", "stopped", "offline"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

export const PAGE_SIZE_OPTIONS = [10, 25, 50];
