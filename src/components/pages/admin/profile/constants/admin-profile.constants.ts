import { minutesAgo } from "@/lib/sample-time";
import type { SignInEvent, UserProfile } from "@/types/profile.types";

// TODO(auth): the signed-in admin's profile and sign-in history.
export const ADMIN_PROFILE: UserProfile = {
  firstName: "Alex",
  lastName: "Morgan",
  email: "admin@example.com",
  roleLabel: "Owner · Admin console",
  phone: "",
  timezone: "Europe/London",
  joinedAt: "2025-11-03T09:00:00.000Z",
  passwordChangedAt: minutesAgo(60 * 24 * 21),
};

export const ADMIN_SIGN_INS: SignInEvent[] = [
  {
    id: "a1",
    device: "Firefox on Linux",
    kind: "desktop",
    location: "London, GB",
    ip: "203.0.113.10",
    at: minutesAgo(1),
    current: true,
  },
  {
    id: "a2",
    device: "Safari on iPhone",
    kind: "mobile",
    location: "London, GB",
    ip: "203.0.113.11",
    at: minutesAgo(60 * 26),
  },
  {
    id: "a3",
    device: "Firefox on Linux",
    kind: "desktop",
    location: "Manchester, GB",
    ip: "198.51.100.230",
    at: minutesAgo(60 * 24 * 2),
  },
];
