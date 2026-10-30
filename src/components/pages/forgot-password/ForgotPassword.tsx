import { AuthLayout } from "@/components/pages/login/components/AuthLayout";
import { ForgotPasswordForm } from "@/components/pages/forgot-password/components/ForgotPasswordForm";

export function ForgotPassword() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
