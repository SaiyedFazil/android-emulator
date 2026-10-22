import { AppShell } from "@/components/common/AppShell";
import { ADMIN_SHELL } from "@/lib/shell/admin.shell";

/** Shell for every `/admin` route: the admin menu, never the console's. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  // TODO(auth): guard admin routes in proxy.ts (cookie-only role check) and with requireRole() in
  // each admin Server Action / data read. Reading the session here would make every admin page
  // render per request instead of serving its static shell.
  return <AppShell config={ADMIN_SHELL}>{children}</AppShell>;
}
