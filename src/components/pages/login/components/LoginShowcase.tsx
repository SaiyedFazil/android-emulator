import { Smartphone } from "lucide-react";

import { DeviceCluster, DevicePeek } from "@/components/pages/login/components/DeviceCluster";
import { Reveal } from "@/components/pages/login/components/Reveal";
import { SHOWCASE_FEATURES } from "@/components/pages/login/constants/login.constants";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

/**
 * The graphite side of the sign-in page. Like the sidebar it stays graphite in both themes: the
 * `dark` class makes it a dark-mode island, so every token inside resolves to its dark shade.
 * Desktop shows the full device cluster and pitch; below `lg` it shrinks to a header band with
 * one phone peeking out above the form.
 */
export function LoginShowcase() {
  return (
    <section
      aria-label={`About ${APP_NAME}`}
      className="dark relative flex h-75 shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground lg:h-auto lg:min-h-svh lg:flex-[1.35_1_0%] lg:gap-6 lg:border-r lg:border-sidebar-border lg:px-12 lg:pt-10 lg:pb-11"
    >
      <div className="absolute inset-0 showcase-grid" />

      <Reveal className="absolute inset-0 lg:hidden" delay={100}>
        <DevicePeek />
      </Reveal>

      <Reveal className="relative flex items-center gap-3 px-5 pt-5 lg:p-0">
        <span className="flex size-9 items-center justify-center rounded-[10px] bg-sidebar-primary text-sidebar-primary-foreground lg:size-9.5">
          <Smartphone className="lg:size-9.5" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold tracking-tight text-sidebar-accent-foreground">
            {APP_NAME}
          </span>
          <span className="text-xs text-sidebar-muted">{APP_TAGLINE}</span>
        </span>
      </Reveal>

      <Reveal className="relative hidden flex-1 lg:flex" delay={120}>
        <DeviceCluster />
      </Reveal>

      <Reveal className="relative hidden flex-col gap-5.5 lg:flex" delay={220}>
        <div className="flex flex-col gap-3">
          <p className="text-[40px] leading-[1.08] font-semibold tracking-[-0.03em] text-sidebar-accent-foreground">
            Every emulator,
            <br />
            <span className="text-primary">one console.</span>
          </p>
          <p className="max-w-115 text-[15px] leading-relaxed">
            Start, monitor and connect to Android emulators across all your hosts, from a single
            place.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-7 gap-y-3 border-t border-sidebar-border pt-5">
          {SHOWCASE_FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="flex items-center gap-2.5 text-[13px] text-sidebar-accent-foreground/90"
            >
              <span className="flex size-7.5 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent text-primary">
                <feature.icon className="size-3.75" />
              </span>
              {feature.title}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
