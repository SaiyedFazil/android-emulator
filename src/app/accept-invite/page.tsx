import type { Metadata } from "next";

import { AcceptInvite } from "@/components/pages/accept-invite/AcceptInvite";

// No referrer: an emailed link's token must never travel to another site.
export const metadata: Metadata = { title: "Accept invitation", referrer: "no-referrer" };

export default function AcceptInvitePage() {
  return <AcceptInvite />;
}
