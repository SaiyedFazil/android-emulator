import type { AdminAccess } from "@/types/admin.types";

// TODO(auth): enforced by requireRole/permission checks once admin auth exists.
export const ACCESS_LEVELS: { access: AdminAccess; summary: string; can: string[] }[] = [
  {
    access: "owner",
    summary: "Full control of the platform.",
    can: [
      "Everything an Admin can do",
      "Billing settings and payment provider",
      "Invite and remove admins",
    ],
  },
  {
    access: "admin",
    summary: "Runs customers and infrastructure day to day.",
    can: [
      "Manage organizations, users and subscriptions",
      "Edit plans",
      "Operate emulators and hosts",
    ],
  },
  {
    access: "support",
    summary: "Read-only — for answering customer questions.",
    can: ["View customers, billing and the fleet", "Read the audit log"],
  },
];

/** The signed-in admin — can't remove themselves. TODO(auth): from the session. */
export const CURRENT_ADMIN_ID = "adm_alex";
