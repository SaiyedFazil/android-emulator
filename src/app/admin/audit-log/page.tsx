import type { Metadata } from "next";

import { AuditLog } from "@/components/pages/admin/audit-log/AuditLog";

export const metadata: Metadata = { title: "Audit log" };

export default function AuditLogPage() {
  return <AuditLog />;
}
