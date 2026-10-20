"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { useHashState } from "@/hooks/use-hash-state";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export interface SectionTab {
  /** Also the URL hash that selects this tab, e.g. `/settings#appearance`. */
  value: string;
  label: string;
  /** One-line hint shown under the label in the vertical layout. */
  description?: string;
  /** A rendered icon element, e.g. `<Bell />` (elements can cross the server/client boundary). */
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface SectionTabsProps {
  tabs: SectionTab[];
  /** Accessible name for the tab list, e.g. "Settings sections". */
  label: string;
}

/**
 * Page sections as tabs: a vertical nav beside the content from `lg` up, horizontal underline
 * tabs below it. The selection lives in the URL hash so it survives reloads and can be linked.
 * Every panel stays mounted, so unsaved input survives switching tabs.
 */
export function SectionTabs({ tabs, label }: SectionTabsProps) {
  const [hash, setHash] = useHashState();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const value = tabs.some((t) => t.value === hash) ? hash : tabs[0].value;
  const listRef = React.useRef<HTMLDivElement>(null);

  // In the scrolling tab row, keep the selected tab in view (e.g. when opened from a link).
  React.useEffect(() => {
    if (isDesktop) return;
    listRef.current
      ?.querySelector<HTMLElement>("[role=tab][data-state=active]")
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [value, isDesktop]);

  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={setHash}
      // Arrow keys follow the layout: up/down in the vertical nav, left/right in the tab row.
      orientation={isDesktop ? "vertical" : "horizontal"}
      className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8"
    >
      <div className="-mx-4 overflow-x-auto border-b px-4 md:mx-0 md:px-0 lg:sticky lg:top-24 lg:w-64 lg:shrink-0 lg:overflow-visible lg:border-0">
        <TabsPrimitive.List ref={listRef} aria-label={label} className="flex gap-1 lg:flex-col">
          {tabs.map((tab) => (
            <TabsPrimitive.Trigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "group/section relative flex shrink-0 items-center gap-2 rounded-lg text-left text-sm font-medium whitespace-nowrap transition-colors outline-none",
                "text-muted-foreground hover:text-foreground data-[state=active]:text-foreground",
                "focus-visible:ring-3 focus-visible:ring-ring/50",
                // Below lg: underline tab.
                "h-10 px-2.5 after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100",
                // lg and up: nav item.
                "lg:h-auto lg:w-full lg:gap-3 lg:px-2.5 lg:py-2 lg:whitespace-normal lg:after:hidden",
                "lg:hover:bg-muted/70 lg:data-[state=active]:bg-card lg:data-[state=active]:shadow-xs lg:data-[state=active]:ring-1 lg:data-[state=active]:ring-border"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex shrink-0 items-center justify-center transition-colors [&_svg]:size-4",
                  "group-data-[state=active]/section:text-primary",
                  "lg:size-8 lg:rounded-md lg:bg-muted",
                  "lg:group-data-[state=active]/section:bg-accent lg:group-data-[state=active]/section:text-accent-foreground"
                )}
              >
                {tab.icon}
              </span>
              <span className="flex min-w-0 flex-col">
                <span>{tab.label}</span>
                {tab.description ? (
                  <span className="hidden text-xs font-normal text-muted-foreground lg:block">
                    {tab.description}
                  </span>
                ) : null}
              </span>
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
      </div>

      <div className="min-w-0 flex-1">
        {tabs.map((tab) => (
          <TabsPrimitive.Content
            key={tab.value}
            value={tab.value}
            forceMount
            className="max-w-3xl outline-none data-[state=inactive]:hidden"
          >
            {tab.content}
          </TabsPrimitive.Content>
        ))}
      </div>
    </TabsPrimitive.Root>
  );
}
