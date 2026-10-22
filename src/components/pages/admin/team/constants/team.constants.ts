import { minutesAgo } from "@/lib/sample-time";
import type { AdminMember } from "@/types/admin.types";

// TODO(auth): admin accounts and their access levels come from the backend.
export const ADMIN_TEAM: AdminMember[] = [
  {
    id: "adm_alex",
    name: "Alex Morgan",
    email: "admin@example.com",
    access: "owner",
    status: "active",
    twoFactor: true,
    lastActiveAt: minutesAgo(1),
  },
  {
    id: "adm_riya",
    name: "Riya Kapoor",
    email: "riya.kapoor@example.com",
    access: "admin",
    status: "active",
    twoFactor: true,
    lastActiveAt: minutesAgo(95),
  },
  {
    id: "adm_jordan",
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    access: "support",
    status: "active",
    twoFactor: true,
    lastActiveAt: minutesAgo(480),
  },
  {
    id: "adm_taylor",
    name: "Taylor Brooks",
    email: "taylor.brooks@example.com",
    access: "support",
    status: "invited",
    twoFactor: false,
    lastActiveAt: null,
  },
];
