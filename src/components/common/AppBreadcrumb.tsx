"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import type { NavGroup } from "@/types/nav.types";

/** Labels for fixed sub-routes below a menu item (detail-page tabs) and user-menu pages. */
const SEGMENT_LABELS: Record<string, string> = {
  users: "Users",
  emulators: "Emulators",
  billing: "Billing",
  activity: "Activity",
  profile: "Profile",
};

const CRUMB_CLASS = "max-w-[16ch] truncate";

interface AppBreadcrumbProps {
  nav: NavGroup[];
  /** First crumb, e.g. "Admin"; without it the menu group's label is used. */
  root?: string;
  /** id → name for dynamic segments, e.g. an organization id → its name. */
  entityNames?: Record<string, string>;
}

export function AppBreadcrumb({ nav, root, entityNames = {} }: AppBreadcrumbProps) {
  const pathname = usePathname();

  // The deepest menu item that contains this path, so /admin/users/… matches Users.
  const matches = nav.flatMap((group) =>
    group.items
      .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
      .map((item) => ({ group, item }))
  );
  const match = matches.sort((a, b) => b.item.href.length - a.item.href.length)[0];
  if (!match) {
    // Pages reached from the user menu rather than the sidebar (e.g. /admin/profile).
    const label = SEGMENT_LABELS[pathname.split("/").filter(Boolean).at(-1) ?? ""];
    if (!label || !root) return null;
    return (
      <Breadcrumb className="min-w-0 flex-1 overflow-hidden">
        <BreadcrumbList className="flex-nowrap whitespace-nowrap">
          <BreadcrumbItem className="hidden sm:inline-flex">{root}</BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:inline-flex" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const segments = pathname.slice(match.item.href.length).split("/").filter(Boolean);
  const crumbs = [
    { label: match.item.title, href: match.item.href },
    ...segments.map((segment, index) => ({
      label: entityNames[segment] ?? SEGMENT_LABELS[segment] ?? segment,
      href: `${match.item.href}/${segments.slice(0, index + 1).join("/")}`,
    })),
  ];

  return (
    // Shrinks and clips rather than running under the navbar's buttons.
    <Breadcrumb className="min-w-0 flex-1 overflow-hidden">
      <BreadcrumbList className="flex-nowrap whitespace-nowrap">
        <BreadcrumbItem className="hidden sm:inline-flex">
          {root ?? match.group.label}
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden sm:inline-flex" />
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          // On phones only the current page shows; the sidebar sheet carries the rest.
          const hideOnPhone = !last;
          return (
            <Fragment key={crumb.href}>
              <BreadcrumbItem className={cn("min-w-0", hideOnPhone && "hidden sm:inline-flex")}>
                {last ? (
                  <BreadcrumbPage
                    className={cn("block font-medium", CRUMB_CLASS, "max-sm:max-w-full")}
                    title={crumb.label}
                  >
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className={CRUMB_CLASS} title={crumb.label}>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {last ? null : (
                <BreadcrumbSeparator className={cn(hideOnPhone && "hidden sm:inline-flex")} />
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
