import type { Metadata } from "next";

import { Hosts } from "@/components/pages/admin/hosts/Hosts";

export const metadata: Metadata = { title: "Hosts" };

export default function HostsPage() {
  return <Hosts />;
}
