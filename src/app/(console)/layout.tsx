import { AppShell } from "@/components/common/AppShell";
import { CONSOLE_SHELL } from "@/lib/shell/console.shell";

/** Sidebar and navbar for the console routes. `/login` sits outside this group, without them. */
export default function ConsoleLayout({ children }: LayoutProps<"/">) {
  return <AppShell config={CONSOLE_SHELL}>{children}</AppShell>;
}
