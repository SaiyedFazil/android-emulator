import type { Metadata } from "next";

import { AdminSettings } from "@/components/pages/admin/settings/AdminSettings";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return <AdminSettings />;
}
