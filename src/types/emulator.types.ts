export type EmulatorStatus = "running" | "booting" | "stopped" | "offline";

export interface Emulator {
  id: string;
  name: string;
  /** adb serial, e.g. "emulator-5554" */
  serial: string;
  model: string;
  androidVersion: string;
  apiLevel: number;
  status: EmulatorStatus;
  host: string;
  port: number;
  cpuCores: number;
  ramGb: number;
  /** ISO 8601 timestamp */
  lastActive: string;
}
