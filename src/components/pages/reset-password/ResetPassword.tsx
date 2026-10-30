import { AuthLayout } from "@/components/pages/login/components/AuthLayout";
import { ResetPasswordForm } from "@/components/pages/reset-password/components/ResetPasswordForm";

export function ResetPassword() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
