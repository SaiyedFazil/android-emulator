"use client";

import * as React from "react";
import { Bell, Search } from "lucide-react";

import { AppBreadcrumb } from "@/components/common/AppBreadcrumb";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NOTIFICATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AppNavbar() {
  const searchRef = React.useRef<HTMLInputElement>(null);
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  // Ctrl/⌘ + K focuses the search field.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-card/85 px-4 backdrop-blur supports-backdrop-filter:bg-card/70 md:px-7">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator
        orientation="vertical"
        className="mr-1 data-vertical:h-5 data-vertical:self-center"
      />
      <AppBreadcrumb />

      <div className="ml-auto flex items-center gap-2">
        {/* TODO(api): wire search to the emulator index. */}
        <label className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-border bg-background px-3 text-muted-foreground transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40 md:flex lg:w-72">
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            aria-label="Search emulators"
            placeholder="Search emulators, IPs…"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Kbd className="border border-border bg-card font-mono text-[11px]">Ctrl K</Kbd>
        </label>
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Search"
          className="text-muted-foreground md:hidden"
        >
          <Search />
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon-lg"
              aria-label={`Notifications, ${unread} unread`}
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell />
              {unread > 0 ? (
                <span className="absolute top-2 right-2 size-2 rounded-full bg-status-offline ring-2 ring-card" />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              <span className="text-xs font-normal text-muted-foreground">{unread} unread</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {NOTIFICATIONS.map((n) => (
              <DropdownMenuItem key={n.id} className="items-start gap-3 py-2.5">
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    n.unread ? "bg-primary" : "bg-border"
                  )}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm text-foreground">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
