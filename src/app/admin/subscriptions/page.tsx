import type { Metadata } from "next";

import { Subscriptions } from "@/components/pages/admin/subscriptions/Subscriptions";

export const metadata: Metadata = { title: "Subscriptions" };

export default function SubscriptionsPage() {
  return <Subscriptions />;
}
