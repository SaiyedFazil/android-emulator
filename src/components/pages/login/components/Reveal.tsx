import { cn } from "@/lib/utils";

/**
 * Fades and lifts its content in on first paint. Plain CSS (tw-animate-css) rather than Motion,
 * so nothing is server-rendered hidden waiting for JavaScript. `delay` (ms) staggers siblings.
 */
export function Reveal({
  delay = 0,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & { delay?: number }) {
  return (
    <div
      className={cn(
        "animate-in duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] fill-mode-both fade-in slide-in-from-bottom-4 motion-reduce:animate-none",
        className
      )}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...props}
    />
  );
}
