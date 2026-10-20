"use client";

import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NAV_GROUPS } from "@/lib/constants";

export function AppBreadcrumb() {
  const pathname = usePathname();
  const group = NAV_GROUPS.find((g) => g.items.some((item) => pathname.startsWith(item.href)));
  const item = group?.items.find((i) => pathname.startsWith(i.href));

  if (!group || !item) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap whitespace-nowrap">
        <BreadcrumbItem className="hidden sm:inline-flex">{group.label}</BreadcrumbItem>
        <BreadcrumbSeparator className="hidden sm:inline-flex" />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium">{item.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
