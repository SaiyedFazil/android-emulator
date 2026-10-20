import { AppNavbar } from "@/components/common/AppNavbar";
import { AppSidebar } from "@/components/common/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppNavbar />
        <div className="mx-auto w-full max-w-[1240px] flex-1 p-4 md:p-7">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
