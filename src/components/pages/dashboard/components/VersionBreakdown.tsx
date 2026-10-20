import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Emulator } from "@/types/emulator.types";

/** Emulators per Android version, newest first. */
function groupByVersion(list: Emulator[]) {
  const counts = new Map<string, { count: number; api: number }>();
  for (const e of list) {
    const entry = counts.get(e.androidVersion) ?? { count: 0, api: e.apiLevel };
    entry.count += 1;
    counts.set(e.androidVersion, entry);
  }
  return [...counts.entries()]
    .map(([version, v]) => ({ version, ...v }))
    .sort((a, b) => b.api - a.api);
}

export function VersionBreakdown({ emulators }: { emulators: Emulator[] }) {
  const versions = groupByVersion(emulators);
  const max = Math.max(...versions.map((v) => v.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Android versions</CardTitle>
        <CardDescription>Share of the fleet</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {versions.map((v, i) => (
          <div key={v.version} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between text-[13px]">
              <span>
                Android {v.version}
                <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">
                  API {v.api}
                </span>
              </span>
              <span className="font-mono text-muted-foreground tabular">
                {v.count}
                <span className="ml-1 text-[11px]">
                  ({Math.round((v.count / emulators.length) * 100)}%)
                </span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(v.count / max) * 100}%`, opacity: 1 - i * 0.18 }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
