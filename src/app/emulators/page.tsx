import type { Metadata } from "next";

import { Emulators } from "@/components/pages/emulators/Emulators";

export const metadata: Metadata = { title: "Emulators" };

export default function EmulatorsPage() {
  return <Emulators />;
}
