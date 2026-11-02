import type {
  HostStatus,
  InvoiceStatus,
  MemberStatus,
  OrgRole,
  OrgStatus,
  SubscriptionStatus,
  TeamMember,
} from "@/types/admin.types";
import type { UserStatus } from "@/types/auth.types";
import type { BadgeTone } from "@/types/badge.types";

type StatusMap<K extends string> = Record<K, { label: string; tone: BadgeTone }>;

export const ORG_STATUS: StatusMap<OrgStatus> = {
  active: { label: "Active", tone: "success" },
  trialing: { label: "Trialing", tone: "info" },
  past_due: { label: "Past due", tone: "warning" },
  suspended: { label: "Suspended", tone: "danger" },
};

export const SUBSCRIPTION_STATUS: StatusMap<SubscriptionStatus> = {
  active: { label: "Active", tone: "success" },
  trialing: { label: "Trialing", tone: "info" },
  past_due: { label: "Past due", tone: "warning" },
  canceled: { label: "Canceled", tone: "neutral" },
};

export const INVOICE_STATUS: StatusMap<InvoiceStatus> = {
  paid: { label: "Paid", tone: "success" },
  open: { label: "Open", tone: "info" },
  failed: { label: "Failed", tone: "danger" },
  refunded: { label: "Refunded", tone: "neutral" },
  void: { label: "Void", tone: "neutral" },
};

export const MEMBER_STATUS: StatusMap<MemberStatus> = {
  active: { label: "Active", tone: "success" },
  invited: { label: "Invited", tone: "info" },
  suspended: { label: "Suspended", tone: "danger" },
};

export const HOST_STATUS: StatusMap<HostStatus> = {
  healthy: { label: "Healthy", tone: "success" },
  degraded: { label: "Degraded", tone: "warning" },
  offline: { label: "Offline", tone: "danger" },
  maintenance: { label: "Maintenance", tone: "neutral" },
};

export const ORG_ROLE: StatusMap<OrgRole> = {
  owner: { label: "Owner", tone: "info" },
  admin: { label: "Admin", tone: "neutral" },
  member: { label: "Member", tone: "neutral" },
};

/** Platform team roles, as the API sends them. */
export const TEAM_ROLE: StatusMap<TeamMember["role"]> = {
  OWNER: { label: "Owner", tone: "info" },
  ADMIN: { label: "Admin", tone: "neutral" },
  SUPPORT: { label: "Support", tone: "neutral" },
};

/** Account status, as the API sends it. */
export const USER_STATUS: StatusMap<UserStatus> = {
  ACTIVE: { label: "Active", tone: "success" },
  INVITED: { label: "Invited", tone: "info" },
  SUSPENDED: { label: "Suspended", tone: "danger" },
};
