import { Power } from "lucide-react";

import { cn } from "@/lib/utils";

/* Illustrations for the sign-in showcase. They are drawn inside a `.dark` island, so the tokens
 * resolve to their dark-mode shades whatever theme the page is in. */

const FRAME_SIZES = {
  lg: { frame: "h-[404px] w-[196px] rounded-[36px] p-[7px]", screen: "rounded-[29px]" },
  md: { frame: "h-[360px] w-[176px] rounded-[32px] p-1.5", screen: "rounded-[26px]" },
  sm: { frame: "h-[332px] w-[162px] rounded-[30px] p-1.5", screen: "rounded-[24px]" },
};

export function PhoneFrame({
  size,
  children,
}: {
  size: keyof typeof FRAME_SIZES;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("border border-input bg-sidebar-accent shadow-2xl", FRAME_SIZES[size].frame)}
    >
      <div
        className={cn(
          "relative flex size-full flex-col overflow-hidden bg-background",
          FRAME_SIZES[size].screen
        )}
      >
        <span className="absolute top-2.5 left-1/2 size-2 -translate-x-1/2 rounded-full bg-secondary" />
        {children}
      </div>
    </div>
  );
}

const APP_TILES = [
  "bg-primary",
  "bg-secondary",
  "bg-chart-2",
  "bg-chart-5",
  "bg-secondary",
  "bg-accent-foreground/85",
  "bg-chart-2",
  "bg-primary",
  "bg-chart-5",
  "bg-chart-2",
  "bg-secondary",
  "bg-chart-3",
];
const DOCK_TILES = ["bg-secondary", "bg-primary", "bg-chart-2", "bg-chart-5"];
const SPARKLINE = "M0 30 L14 26 L28 28 L42 18 L56 22 L70 12 L84 16 L98 8 L112 14 L126 6 L140 10";

/** A home screen: a usage widget over a grid of app tiles. */
export function RunningScreen({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-1 flex-col gap-3.5 px-3.5 pt-8 pb-3.5">
      <div className="flex flex-col gap-2 rounded-2xl bg-accent p-3">
        <div className="flex items-center justify-between">
          <span className="h-1.5 w-12 rounded-full bg-chart-3/75" />
          <span className="size-1.5 rounded-full bg-status-running" />
        </div>
        <svg viewBox="0 0 140 40" preserveAspectRatio="none" className="h-10 w-full">
          <path d={`${SPARKLINE} L140 40 L0 40 Z`} className="fill-chart-3/15" />
          <path
            d={SPARKLINE}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="stroke-chart-3"
          />
        </svg>
        <span className="h-[5px] w-[72%] rounded-full bg-chart-5" />
        <span className="h-[5px] w-[46%] rounded-full bg-chart-5" />
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {APP_TILES.slice(0, rows * 4).map((tone, index) => (
          <span key={index} className={cn("aspect-square rounded-[10px]", tone)} />
        ))}
      </div>
      <div className="flex-1" />
      <div className="grid grid-cols-4 gap-2.5 rounded-[18px] bg-card p-2">
        {DOCK_TILES.map((tone, index) => (
          <span key={index} className={cn("aspect-square rounded-[10px]", tone)} />
        ))}
      </div>
    </div>
  );
}

export function BootingScreen({ version }: { version: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-5">
      <svg viewBox="0 0 40 40" className="size-10 motion-safe:animate-spin">
        <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" className="stroke-secondary" />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="28 100"
          className="stroke-status-booting"
        />
      </svg>
      <span className="font-mono text-[11px] tracking-[0.04em] text-foreground/80">Booting…</span>
      <span className="h-1 w-full overflow-hidden rounded-full bg-secondary">
        <span className="block h-full w-1/2 rounded-full bg-status-booting motion-safe:animate-boot" />
      </span>
      <span className="font-mono text-[10px] text-sidebar-muted">{version}</span>
    </div>
  );
}

export function StoppedScreen({ version }: { version: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <span className="flex size-11 items-center justify-center rounded-full border border-input text-sidebar-muted">
        <Power className="size-[18px]" />
      </span>
      <span className="font-mono text-[11px] tracking-[0.04em] text-sidebar-foreground">
        Stopped
      </span>
      <span className="font-mono text-[10px] text-sidebar-muted">{version}</span>
    </div>
  );
}
