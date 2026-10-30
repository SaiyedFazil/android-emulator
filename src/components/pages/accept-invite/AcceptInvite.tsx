import { AuthLayout } from "@/components/pages/login/components/AuthLayout";
import { AcceptInviteForm } from "@/components/pages/accept-invite/components/AcceptInviteForm";

export function AcceptInvite() {
  return (
    <AuthLayout>
      <AcceptInviteForm />
    </AuthLayout>
  );
}
