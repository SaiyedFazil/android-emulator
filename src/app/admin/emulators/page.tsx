import type { Metadata } from "next";

import { FleetEmulators } from "@/components/pages/admin/emulators/FleetEmulators";

export const metadata: Metadata = { title: "Emulators" };

export default function FleetEmulatorsPage() {
  return <FleetEmulators />;
}
