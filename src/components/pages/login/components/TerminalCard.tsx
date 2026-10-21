"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SquareTerminal } from "lucide-react";

import {
  TERMINAL_SCRIPT,
  type TerminalLine,
} from "@/components/pages/login/constants/login.constants";
import { cn } from "@/lib/utils";

type Entry = TerminalLine & { id: number };

const SPINNER = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
const CLEAR_STEP = TERMINAL_SCRIPT.find((step) => step.clears);

/** The screen once every command has run. It renders first (so server and client agree) and
 * stays put when the viewer prefers reduced motion. */
const TRANSCRIPT: Entry[] = TERMINAL_SCRIPT.filter((step) => !step.clears)
  .flatMap((step): TerminalLine[] => [{ kind: "command", text: step.command }, ...step.output])
  .map((line, id) => ({ ...line, id }));

function LineText({ line }: { line: TerminalLine }) {
  switch (line.kind) {
    case "command":
      return (
        <span>
          <span className="text-primary">$ </span>
          {line.text}
        </span>
      );
    case "note":
      return <span className="text-sidebar-muted">{line.text}</span>;
    case "success":
      return <span className="text-status-running-foreground">✓ {line.text}</span>;
    case "device":
      return (
        <>
          <span>{line.text}</span>
          <span
            className={
              line.state === "offline"
                ? "text-status-offline-foreground"
                : "text-status-running-foreground"
            }
          >
            {line.state}
          </span>
        </>
      );
  }
}

/** A scripted adb session that types itself out on a loop. */
export function TerminalCard({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [lines, setLines] = React.useState(TRANSCRIPT);
  const [typed, setTyped] = React.useState("");
  const [pending, setPending] = React.useState<string | null>(null);
  const [frame, setFrame] = React.useState(0);

  React.useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;
    let spinner: number | undefined;
    let nextId = TRANSCRIPT.length;
    const timers = new Set<number>();

    const pause = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });
    const append = (line: TerminalLine) =>
      setLines((current) => [...current, { ...line, id: nextId++ }]);

    async function play() {
      // The card opens on the finished transcript, so the first pass starts with `clear`.
      const steps = CLEAR_STEP ? [CLEAR_STEP, ...TERMINAL_SCRIPT] : TERMINAL_SCRIPT;
      const loopStart = steps.length - TERMINAL_SCRIPT.length;
      let index = 0;
      await pause(2600);
      while (!cancelled) {
        const step = steps[index];
        for (let length = 1; length <= step.command.length; length++) {
          setTyped(step.command.slice(0, length));
          await pause(45 + Math.random() * 65);
          if (cancelled) return;
        }
        await pause(340);
        if (cancelled) return;
        setTyped("");
        if (step.clears) setLines([]);
        else append({ kind: "command", text: step.command });

        if (step.pending) {
          setPending(step.pending.text);
          spinner = window.setInterval(() => setFrame((f) => (f + 1) % SPINNER.length), 80);
          await pause(step.pending.ms);
          window.clearInterval(spinner);
          if (cancelled) return;
          setPending(null);
        }
        for (const line of step.output) {
          await pause(160);
          if (cancelled) return;
          append(line);
        }
        await pause(step.holdMs);
        index = index + 1 < steps.length ? index + 1 : loopStart;
      }
    }

    void play();
    return () => {
      cancelled = true;
      window.clearInterval(spinner);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [reduceMotion]);

  return (
    <div
      className={cn(
        "w-64 overflow-hidden rounded-xl border border-input bg-card/95 shadow-2xl backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-3 py-2 font-mono text-[11px] text-sidebar-muted">
        <span className="flex items-center gap-2">
          <SquareTerminal className="size-3.5 text-primary" aria-hidden />
          console — adb
        </span>
        <span className="flex items-center gap-1.5 text-[10px] tracking-[0.08em] text-status-running-foreground">
          <span className="size-1.5 rounded-full bg-current motion-safe:animate-halo" />
          LIVE
        </span>
      </div>
      <div className="flex h-44 flex-col justify-end overflow-hidden px-3 pt-2.5 pb-3 font-mono text-[11px] leading-[1.75] text-foreground/80">
        <AnimatePresence initial={false}>
          {lines.map((line) => (
            <motion.div
              key={line.id}
              layout="position"
              initial={line.kind === "command" ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex justify-between gap-2 whitespace-pre"
            >
              <LineText line={line} />
            </motion.div>
          ))}
        </AnimatePresence>
        {pending ? (
          <div className="flex gap-2">
            <span className="text-primary">{SPINNER[frame]}</span>
            <span className="text-sidebar-muted">{pending}</span>
          </div>
        ) : (
          <div className="flex items-center whitespace-pre">
            <span className="text-primary">$ </span>
            <span>{typed}</span>
            {/* Solid while typing, blinking while idle — as a real terminal cursor does. */}
            <span
              className={cn(
                "ml-px inline-block h-3.25 w-1.5 bg-primary",
                !typed && "motion-safe:animate-caret"
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
