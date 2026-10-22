import type { Metadata } from "next";

import { Billing } from "@/components/pages/admin/billing/Billing";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return <Billing />;
}
