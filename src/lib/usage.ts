export type UsageLevel = "ok" | "high" | "full" | "over";

/** How full a limit is: the bar's width (clamped to the track) and a level for its colour. */
export function usageLevel(used: number, limit: number): { fraction: number; level: UsageLevel } {
  if (limit <= 0) return used > 0 ? { fraction: 1, level: "over" } : { fraction: 0, level: "ok" };
  const ratio = used / limit;
  const level: UsageLevel =
    ratio > 1 ? "over" : ratio === 1 ? "full" : ratio >= 0.8 ? "high" : "ok";
  return { fraction: Math.min(ratio, 1), level };
}
