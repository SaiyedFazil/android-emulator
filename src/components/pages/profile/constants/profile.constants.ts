import { minutesAgo } from "@/lib/sample-time";
import type { SignInEvent, UserProfile } from "@/types/profile.types";

// TODO(auth): replace with the signed-in user's profile.
export const PROFILE: UserProfile = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  role: "Administrator",
  phone: "",
  timezone: "Asia/Kolkata",
  joinedAt: "2026-03-02T10:00:00.000Z",
  passwordChangedAt: minutesAgo(60 * 24 * 47),
};

// TODO(auth): sign-in history endpoint.
export const SIGN_INS: SignInEvent[] = [
  {
    id: "s1",
    device: "Chrome on Windows",
    kind: "desktop",
    location: "Mumbai, IN",
    ip: "192.168.1.12",
    at: minutesAgo(1),
    current: true,
  },
  {
    id: "s2",
    device: "Safari on iPhone",
    kind: "mobile",
    location: "Mumbai, IN",
    ip: "10.0.0.41",
    at: minutesAgo(60 * 20),
  },
  {
    id: "s3",
    device: "Edge on Windows",
    kind: "desktop",
    location: "Pune, IN",
    ip: "192.168.4.7",
    at: minutesAgo(60 * 24 * 3),
  },
  {
    id: "s4",
    device: "Firefox on Ubuntu",
    kind: "desktop",
    location: "Bengaluru, IN",
    ip: "172.16.0.9",
    at: minutesAgo(60 * 24 * 9),
  },
];

export const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Kolkata", label: "India (IST, UTC+5:30)" },
  { value: "Asia/Dubai", label: "Gulf (GST, UTC+4)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Central Europe (CET)" },
  { value: "America/New_York", label: "US Eastern (ET)" },
  { value: "America/Los_Angeles", label: "US Pacific (PT)" },
  { value: "Asia/Singapore", label: "Singapore (SGT, UTC+8)" },
];
