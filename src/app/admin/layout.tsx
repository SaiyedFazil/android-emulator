import { AppShell } from "@/components/common/AppShell";
import { ADMIN_SHELL } from "@/lib/shell/admin.shell";

/** Shell for every `/admin` route: the admin menu, never the console's. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  // proxy.ts lets only platform staff in, and the API checks every call. Reading the session here
  // would make every admin page render per request instead of serving its static shell.
  return <AppShell config={ADMIN_SHELL}>{children}</AppShell>;
}
