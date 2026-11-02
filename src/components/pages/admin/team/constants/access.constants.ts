import type { TeamMember } from "@/types/admin.types";

/** One line on what each platform role does, shown under the Invite sheet's role picker. */
export const ACCESS_LEVELS: { role: TeamMember["role"]; summary: string }[] = [
  { role: "OWNER", summary: "Full control of the platform." },
  { role: "ADMIN", summary: "Runs organizations, users and plans day to day." },
  { role: "SUPPORT", summary: "Read-only, for answering customer questions." },
];
