"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, LogOut, Settings, Smartphone, UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { CURRENT_USER, HOST_CAPACITY, NAV_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* Collapsed ("icon") mode is styled through `group-data-[collapsible=icon]:` — the rail is 4rem
 * wide and every button becomes a centred 40px square with its text hidden. */
const MENU_CLASS = "group-data-[collapsible=icon]:items-center";
const ICON_BUTTON_CLASS =
  "group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!";
/** Text beside an icon: visually hidden in the collapsed rail, but kept as the accessible name. */
const LABEL_CLASS = "group-data-[collapsible=icon]:sr-only";
const NAV_BUTTON_CLASS = cn(
  "h-9 gap-3 px-2.5 text-sidebar-foreground [&_svg]:size-[18px]",
  // Expanded: teal bar on the left edge of the active row.
  "data-active:shadow-[inset_2px_0_0_var(--sidebar-ring)]",
  // Collapsed: a lifted tile with a teal icon instead — the bar reads as a glitch on a square.
  "group-data-[collapsible=icon]:data-active:text-sidebar-ring group-data-[collapsible=icon]:data-active:shadow-[inset_0_0_0_1px_var(--sidebar-border)]",
  ICON_BUTTON_CLASS
);

/** Host capacity as a ring — the collapsed stand-in for the capacity card. */
function CapacityRing({ percent }: { percent: number }) {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const label = `Host capacity ${percent}%, ${HOST_CAPACITY.used} of ${HOST_CAPACITY.total} slots in use`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          role="progressbar"
          tabIndex={0}
          aria-label={label}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="relative hidden size-10 items-center justify-center rounded-full outline-none group-data-[collapsible=icon]:flex focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <svg
            viewBox="0 0 36 36"
            className="absolute inset-0 size-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              strokeWidth="3"
              className="stroke-sidebar-border"
            />
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - percent / 100)}
              className="stroke-sidebar-ring"
            />
          </svg>
          <span className="font-mono text-[10px] font-medium text-sidebar-accent-foreground">
            {percent}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10} className="flex-col items-start gap-0.5">
        <span className="font-medium">Host capacity {percent}%</span>
        <span className="opacity-80">
          {HOST_CAPACITY.used} of {HOST_CAPACITY.total} slots in use
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const capacity = Math.round((HOST_CAPACITY.used / HOST_CAPACITY.total) * 100);

  // The mobile drawer stays open after a link click unless we close it.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="px-3 pt-4 pb-2 group-data-[collapsible=icon]:px-2">
        <SidebarMenu className={MENU_CLASS}>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip={APP_NAME}
              className={cn("hover:bg-transparent active:bg-transparent", ICON_BUTTON_CLASS)}
            >
              <Link href="/dashboard" onClick={closeOnMobile}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-primary text-primary-foreground group-data-[collapsible=icon]:size-9">
                  <Smartphone className="size-4.5" />
                </span>
                <span className={cn("flex min-w-0 flex-col leading-tight", LABEL_CLASS)}>
                  <span className="truncate text-[15px] font-semibold tracking-tight text-sidebar-accent-foreground">
                    {APP_NAME}
                  </span>
                  <span className="truncate text-xs text-sidebar-muted">{APP_TAGLINE}</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-1.5 group-data-[collapsible=icon]:px-0">
        {NAV_GROUPS.map((group, index) => (
          <Fragment key={group.label}>
            {/* Group labels fade out when collapsed; a short rule keeps the groups apart. */}
            {index > 0 ? (
              <SidebarSeparator className="mx-auto my-1 hidden w-6! group-data-[collapsible=icon]:block" />
            ) : null}
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] font-medium tracking-[0.08em] text-sidebar-muted uppercase">
                {group.label}
              </SidebarGroupLabel>
              <SidebarMenu className={cn("gap-1", MENU_CLASS)}>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.badge ? `${item.title} · ${item.badge}` : item.title}
                      className={NAV_BUTTON_CLASS}
                    >
                      <Link href={item.href} onClick={closeOnMobile}>
                        <item.icon />
                        <span className={LABEL_CLASS}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge className="bg-sidebar-accent font-mono text-[11px] text-sidebar-foreground">
                        {item.badge}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </Fragment>
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-3 px-3 pb-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <div className="flex flex-col gap-2 rounded-[10px] border border-sidebar-border p-3 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-sidebar-foreground">Host capacity</span>
            <span className="font-mono text-sidebar-accent-foreground">{capacity}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Host capacity"
            aria-valuenow={capacity}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 overflow-hidden rounded-full bg-sidebar-border"
          >
            <div
              className="h-full rounded-full bg-sidebar-ring"
              style={{ width: `${capacity}%` }}
            />
          </div>
          <span className="text-xs text-sidebar-muted">
            {HOST_CAPACITY.used} of {HOST_CAPACITY.total} slots in use
          </span>
        </div>
        <CapacityRing percent={capacity} />

        <SidebarMenu className={MENU_CLASS}>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={CURRENT_USER.name}
                  className={cn("data-[state=open]:bg-sidebar-accent", ICON_BUTTON_CLASS)}
                >
                  <Avatar className="size-8 rounded-full">
                    <AvatarFallback className="bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                      {CURRENT_USER.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "flex min-w-0 flex-1 flex-col text-left leading-tight",
                      LABEL_CLASS
                    )}
                  >
                    <span className="truncate text-[13px] font-medium text-sidebar-accent-foreground">
                      {CURRENT_USER.name}
                    </span>
                    <span className="truncate text-xs text-sidebar-muted">
                      {CURRENT_USER.email}
                    </span>
                  </span>
                  <ChevronsUpDown className="ml-auto text-sidebar-muted group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "top" : "right"}
                align="end"
                sideOffset={8}
                className="w-56"
              >
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{CURRENT_USER.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {CURRENT_USER.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile" onClick={closeOnMobile}>
                      <UserRound />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/settings" onClick={closeOnMobile}>
                      <Settings />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {/* TODO(auth): end the session before leaving for the sign-in page. */}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/login" onClick={closeOnMobile}>
                    <LogOut />
                    Sign out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
