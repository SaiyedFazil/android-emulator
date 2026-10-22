import type { Metadata } from "next";

import { Plans } from "@/components/pages/admin/plans/Plans";

export const metadata: Metadata = { title: "Plans" };

export default function PlansPage() {
  return <Plans />;
}
