import { AuthLayout } from "@/components/pages/login/components/AuthLayout";
import { LoginForm } from "@/components/pages/login/components/LoginForm";

export function Login() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
