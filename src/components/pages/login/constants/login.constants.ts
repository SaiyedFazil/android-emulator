import { Activity, Cpu, SquareTerminal, type LucideIcon } from "lucide-react";

export type TerminalLine =
  | { kind: "command"; text: string }
  | { kind: "note"; text: string }
  | { kind: "device"; text: string; state: "device" | "offline" }
  | { kind: "success"; text: string };

export type TerminalStep = {
  command: string;
  output: TerminalLine[];
  /** Spinner text shown while the command runs, and for how long. */
  pending?: { text: string; ms: number };
  /** Pause after the output before the next command is typed. */
  holdMs: number;
  /** `clear` wipes the screen instead of being echoed. */
  clears?: boolean;
};

// TODO(api): a scripted sample session — swap for live adb output once hosts are connected.
// Addresses match the sample emulators in `pages/emulators/constants`.
export const TERMINAL_SCRIPT: TerminalStep[] = [
  {
    command: "adb devices",
    holdMs: 1600,
    output: [
      { kind: "note", text: "List of devices attached" },
      { kind: "device", text: "192.168.1.24:5554", state: "device" },
      { kind: "device", text: "192.168.1.24:5556", state: "device" },
      { kind: "device", text: "192.168.1.40:5562", state: "offline" },
    ],
  },
  {
    command: "adb connect 192.168.1.40:5562",
    pending: { text: "connecting…", ms: 1600 },
    holdMs: 3000,
    output: [{ kind: "success", text: "connected to 192.168.1.40:5562" }],
  },
  { command: "clear", clears: true, holdMs: 500, output: [] },
];

export const SHOWCASE_FEATURES: { title: string; icon: LucideIcon }[] = [
  { title: "Live device status", icon: Activity },
  { title: "One-click ADB connect", icon: SquareTerminal },
  { title: "Host resource insight", icon: Cpu },
];
