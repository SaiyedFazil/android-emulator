import { minutesAgo } from "@/lib/sample-time";
import type { SignInEvent } from "@/types/profile.types";

// TODO(api): per-user sign-in history comes from the auth backend. Members not listed here
// show an empty state.
export const MEMBER_SIGN_INS: Record<string, SignInEvent[]> = {
  usr_priya: [
    {
      id: "p1",
      device: "Chrome on macOS",
      kind: "desktop",
      location: "Austin, US",
      ip: "198.51.100.42",
      at: minutesAgo(2),
    },
    {
      id: "p2",
      device: "Safari on iPhone",
      kind: "mobile",
      location: "Austin, US",
      ip: "198.51.100.43",
      at: minutesAgo(60 * 20),
    },
    {
      id: "p3",
      device: "Chrome on macOS",
      kind: "desktop",
      location: "Dallas, US",
      ip: "203.0.113.77",
      at: minutesAgo(60 * 24 * 6),
    },
  ],
  usr_marco: [
    {
      id: "m1",
      device: "Firefox on Ubuntu",
      kind: "desktop",
      location: "Milan, IT",
      ip: "198.51.100.88",
      at: minutesAgo(1),
    },
    {
      id: "m2",
      device: "Chrome on Android",
      kind: "mobile",
      location: "Milan, IT",
      ip: "198.51.100.89",
      at: minutesAgo(60 * 9),
    },
  ],
  usr_samir: [
    {
      id: "s1",
      device: "Edge on Windows",
      kind: "desktop",
      location: "Turin, IT",
      ip: "198.51.100.12",
      at: minutesAgo(1),
    },
    {
      id: "s2",
      device: "Unknown browser",
      kind: "desktop",
      location: "Frankfurt, DE",
      ip: "45.33.12.8",
      at: minutesAgo(60 * 18),
    },
  ],
  usr_alexandria: [
    {
      id: "a1",
      device: "Safari on macOS",
      kind: "desktop",
      location: "London, GB",
      ip: "198.51.100.45",
      at: minutesAgo(3),
    },
  ],
};
