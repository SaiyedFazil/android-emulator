import {
  BootingScreen,
  PhoneFrame,
  RunningScreen,
  StoppedScreen,
} from "@/components/pages/login/components/DevicePhone";
import { TerminalCard } from "@/components/pages/login/components/TerminalCard";
import { cn } from "@/lib/utils";

const CHIPS = {
  running: { label: "Running", text: "text-status-running-foreground", dot: "text-status-running" },
  booting: { label: "Booting", text: "text-status-booting-foreground", dot: "text-status-booting" },
};

function StatusChip({ status, className }: { status: keyof typeof CHIPS; className?: string }) {
  const chip = CHIPS[status];
  return (
    <span
      className={cn(
        "flex items-center gap-2 rounded-full border border-input bg-sidebar-accent/90 py-1.5 pr-3 pl-2.5 text-[12.5px] font-medium whitespace-nowrap shadow-xl backdrop-blur-sm",
        chip.text,
        className
      )}
    >
      <span className={cn("size-2 rounded-full bg-current motion-safe:animate-halo", chip.dot)} />
      {chip.label}
    </span>
  );
}

const RINGS = [
  "size-[300px] border-primary/16",
  "size-[450px] border-primary/11",
  "size-[600px] border-primary/7",
  "size-[760px] border-primary/4",
];
const CENTERED = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full";

/** Concentric "signal" rings with a glow and one ring that keeps spreading outwards. */
function SignalRings({ className }: { className: string }) {
  return (
    <div className={cn("pointer-events-none absolute", className)}>
      <div className={cn(CENTERED, "size-[480px] showcase-glow")} />
      {RINGS.map((ring) => (
        <div key={ring} className={cn(CENTERED, "border", ring)} />
      ))}
      <div
        className={cn(
          CENTERED,
          "size-[600px] border border-primary/45 opacity-0 motion-safe:animate-signal"
        )}
      />
    </div>
  );
}

/** Desktop showcase: three emulators in different states beside a live adb session. */
export function DeviceCluster() {
  return (
    <div className="relative flex min-h-[450px] flex-1 items-center justify-center">
      <SignalRings className="inset-0" />
      <div
        role="img"
        aria-label="Three Android emulators, one running, one booting and one stopped, beside a terminal running adb commands"
        className="relative h-[440px] w-[480px] shrink-0"
      >
        <div className="absolute top-[66px] left-3 -rotate-9">
          <div className="[animation-delay:-3s] motion-safe:animate-float">
            <PhoneFrame size="sm">
              <BootingScreen version="Android 14" />
            </PhoneFrame>
          </div>
        </div>
        <div className="absolute top-[66px] right-3 rotate-9 opacity-90">
          <div className="[animation-delay:-5s] motion-safe:animate-float">
            <PhoneFrame size="sm">
              <StoppedScreen version="Android 13" />
            </PhoneFrame>
          </div>
        </div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2">
          <div className="[animation-delay:-1s] motion-safe:animate-float">
            <PhoneFrame size="lg">
              <RunningScreen />
            </PhoneFrame>
          </div>
        </div>
        <StatusChip status="running" className="absolute top-[42px] left-[300px]" />
        <StatusChip status="booting" className="absolute top-[352px] left-1.5" />
        <TerminalCard className="absolute -right-6 -bottom-2" />
      </div>
    </div>
  );
}

/** Mobile showcase: one phone rising from behind the sign-in sheet. */
export function DevicePeek() {
  return (
    <div
      role="img"
      aria-label="Android emulators, one running and one booting"
      className="absolute inset-0"
    >
      <SignalRings className="inset-x-0 top-[70px] h-[300px] scale-80" />
      <div className="absolute top-24 left-1/2 -translate-x-1/2">
        <div className="[animation-delay:-1s] motion-safe:animate-float">
          <PhoneFrame size="md">
            <RunningScreen rows={2} />
          </PhoneFrame>
        </div>
      </div>
      <StatusChip status="running" className="absolute top-[122px] left-[calc(50%+57px)]" />
      <StatusChip status="booting" className="absolute top-[196px] right-[calc(50%+60px)]" />
    </div>
  );
}
