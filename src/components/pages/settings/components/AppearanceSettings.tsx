"use client";

import * as React from "react";
import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { SettingRow, SettingsCard } from "@/components/pages/settings/components/SettingsCard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

const THEMES: { value: "light" | "dark" | "system"; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** A miniature of the app shell in the given scheme. It uses the literal palette values on
 *  purpose: each preview must show its own theme, whichever theme is active. */
function ThemePreview({ scheme }: { scheme: "light" | "dark" | "system" }) {
  const pane = (dark: boolean) => (
    <div className={cn("flex h-full flex-1 gap-1 p-1.5", dark ? "bg-[#0b0d11]" : "bg-[#f5f6f8]")}>
      <div className="w-1/4 rounded-sm bg-[#111318]" />
      <div className="flex flex-1 flex-col gap-1">
        <div className={cn("h-2 rounded-sm", dark ? "bg-[#12151b]" : "bg-white")} />
        <div className="flex gap-1">
          <div className={cn("h-5 flex-1 rounded-sm", dark ? "bg-[#12151b]" : "bg-white")} />
          <div className={cn("h-5 flex-1 rounded-sm", dark ? "bg-[#12151b]" : "bg-white")} />
        </div>
        <div className={cn("h-1.5 w-1/2 rounded-full", dark ? "bg-[#14b8a6]" : "bg-[#0f766e]")} />
      </div>
    </div>
  );
  return (
    <div aria-hidden="true" className="flex h-20 overflow-hidden rounded-md border">
      {scheme === "system" ? (
        <>
          {pane(false)}
          {pane(true)}
        </>
      ) : (
        pane(scheme === "dark")
      )}
    </div>
  );
}

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [density, setDensity] = React.useState("comfortable");
  const current = mounted ? theme : undefined;

  return (
    <SettingsCard
      title="Appearance"
      description="Theme changes apply immediately on this device."
      hideSave
    >
      <div className="flex flex-col gap-3 pb-4">
        <span id="theme-label" className="text-sm font-medium">
          Theme
        </span>
        <div role="radiogroup" aria-labelledby="theme-label" className="grid gap-3 sm:grid-cols-3">
          {THEMES.map((t) => {
            const selected = current === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "group/theme flex flex-col gap-2.5 rounded-lg border bg-card p-2.5 text-left transition-colors outline-none",
                  "hover:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected && "border-primary ring-3 ring-primary/20"
                )}
              >
                <ThemePreview scheme={t.value} />
                <span className="flex items-center gap-2 px-0.5 text-sm font-medium">
                  <t.icon className="size-4 text-muted-foreground" />
                  {t.label}
                  {selected ? <Check className="ml-auto size-4 text-primary" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <SettingRow label="Density" description="Compact fits more rows in tables.">
        <ToggleGroup
          type="single"
          value={density}
          onValueChange={(v) => v && setDensity(v)}
          aria-label="Density"
          spacing={1}
          className="w-full rounded-lg bg-muted p-1 sm:w-auto"
        >
          {["comfortable", "compact"].map((d) => (
            <ToggleGroupItem
              key={d}
              value={d}
              size="sm"
              className="flex-1 px-3 text-muted-foreground capitalize data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-xs"
            >
              {d}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SettingRow>
    </SettingsCard>
  );
}
