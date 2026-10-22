import { AppNavbar } from "@/components/common/AppNavbar";
import { AppSidebar } from "@/components/common/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { ShellConfig } from "@/types/nav.types";

/** Sidebar, navbar and content column for one area of the app (console or admin). */
export function AppShell({ config, children }: { config: ShellConfig; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar config={config} />
      <SidebarInset className="min-w-0">
        <AppNavbar config={config} />
        <div className="mx-auto w-full max-w-310 flex-1 p-4 md:p-7">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
