import type { TeamMember } from "@/types/admin.types";

/** What each platform role can do; the API enforces it (spec §5). */
export const ACCESS_LEVELS: { role: TeamMember["role"]; summary: string; can: string[] }[] = [
  {
    role: "OWNER",
    summary: "Full control of the platform.",
    can: [
      "Everything an Admin can do",
      "Invite admins and support, change their role, suspend or remove them",
    ],
  },
  {
    role: "ADMIN",
    summary: "Runs organizations, users and plans day to day.",
    can: ["Create and manage organizations and their users", "Create and edit plans"],
  },
  {
    role: "SUPPORT",
    summary: "Read-only, for answering customer questions.",
    can: ["See organizations, users and plans", "Manage their own profile and password"],
  },
];
