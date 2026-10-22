import { Check } from "lucide-react";

import { ChartCard } from "@/components/custom/ChartCard";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { ADMIN_ACCESS } from "@/components/pages/admin/constants/status.constants";
import { ACCESS_LEVELS } from "@/components/pages/admin/team/constants/access.constants";

export function AccessLevels() {
  return (
    <ChartCard title="Access levels" description="What each admin role can do">
      <ul className="flex flex-col divide-y">
        {ACCESS_LEVELS.map((level) => {
          const access = ADMIN_ACCESS[level.access];
          return (
            <li key={level.access} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2">
                <ToneBadge tone={access.tone} label={access.label} dot={false} />
                <span className="text-sm text-muted-foreground">{level.summary}</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {level.can.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}
