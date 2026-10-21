import { AppLayout } from "@/components/common/AppLayout";

/** Sidebar and navbar for the console routes. `/login` sits outside this group, without them. */
export default function ConsoleLayout({ children }: LayoutProps<"/">) {
  return <AppLayout>{children}</AppLayout>;
}
