import type { Metadata } from "next";

import { Organizations } from "@/components/pages/admin/organizations/Organizations";

export const metadata: Metadata = { title: "Organizations" };

export default function OrganizationsPage() {
  return <Organizations />;
}
