import type { Metadata } from "next";

import { ResetPassword } from "@/components/pages/reset-password/ResetPassword";

// No referrer: an emailed link's token must never travel to another site.
export const metadata: Metadata = { title: "Reset password", referrer: "no-referrer" };

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
