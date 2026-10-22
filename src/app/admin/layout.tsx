import { AppShell } from "@/components/common/AppShell";
import { ADMIN_SHELL } from "@/lib/shell/admin.shell";

/** Shell for every `/admin` route: the admin menu, never the console's. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  // TODO(auth): guard admin routes in proxy.ts (cookie-only role check) and with requireRole() in
  // each admin Server Action / data read — NOT by reading the session here: the organization and
  // user detail routes set `ensureStatic = "navigation"`, which forbids cookies() in every layout
  // above them, so a session read in this layout fails their build.
  return <AppShell config={ADMIN_SHELL}>{children}</AppShell>;
}
