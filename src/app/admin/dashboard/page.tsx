import type { Metadata } from "next";

import { AdminDashboard } from "@/components/pages/admin/dashboard/AdminDashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
