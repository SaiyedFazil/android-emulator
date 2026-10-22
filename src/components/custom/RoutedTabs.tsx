"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export interface RoutedTab {
  href: string;
  label: string;
  count?: number;
  /** Active only on this exact path (for an index tab whose siblings live below it). */
  exact?: boolean;
}

/**
 * Tabs that are pages: each is a link, the active one marked with `aria-current="page"`.
 * Scrolls sideways on narrow screens instead of wrapping.
 */
export function RoutedTabs({ tabs, label }: { tabs: RoutedTab[]; label: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto border-b px-4 md:mx-0 md:px-0">
      <ul className="flex gap-1">
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40",
                  active &&
                    "text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary"
                )}
              >
                {tab.label}
                {tab.count !== undefined ? (
                  <span className="rounded-full bg-muted px-1.5 py-px font-mono text-[11px] text-muted-foreground tabular">
                    {tab.count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
