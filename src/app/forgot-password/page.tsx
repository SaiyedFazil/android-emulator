import type { Metadata } from "next";

import { ForgotPassword } from "@/components/pages/forgot-password/ForgotPassword";

// No referrer: an emailed link's token must never travel to another site.
export const metadata: Metadata = { title: "Forgot password", referrer: "no-referrer" };

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
