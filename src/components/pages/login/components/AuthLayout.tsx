import { LoginMotion } from "@/components/pages/login/components/LoginMotion";
import { LoginShowcase } from "@/components/pages/login/components/LoginShowcase";
import { APP_NAME, APP_VERSION } from "@/lib/brand";

/** The sign-in page's frame (showcase panel + form column), shared by every auth page. */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <LoginMotion>
      <div className="flex min-h-svh flex-col bg-background lg:flex-row">
        <LoginShowcase />

        {/* Below `lg` this is a sheet drawn up over the showcase band; in dark mode a hairline
            keeps its rounded edge visible against the graphite. */}
        <section className="relative -mt-6 flex flex-1 flex-col gap-8 rounded-t-3xl bg-background px-5 pt-7 pb-5 sm:px-10 lg:mt-0 lg:flex-[1_1_0%] lg:rounded-none lg:px-12 lg:py-8 max-lg:dark:border-t max-lg:dark:border-sidebar-border">
          <div className="flex flex-1 justify-center lg:items-center lg:py-8">{children}</div>
          <footer className="flex items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground lg:border-0 lg:pt-0">
            <span>© 2026 {APP_NAME}</span>
            <span className="font-mono">v{APP_VERSION}</span>
          </footer>
        </section>
      </div>
    </LoginMotion>
  );
}
