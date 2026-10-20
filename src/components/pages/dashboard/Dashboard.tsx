import { PageHeader } from "@/components/custom/PageHeader";
import { ActivityFeed } from "@/components/pages/dashboard/components/ActivityFeed";
import { DashboardActions } from "@/components/pages/dashboard/components/DashboardActions";
import { RecentEmulators } from "@/components/pages/dashboard/components/RecentEmulators";
import { ResourceUsage } from "@/components/pages/dashboard/components/ResourceUsage";
import { SessionsChart } from "@/components/pages/dashboard/components/SessionsChart";
import { StatCard } from "@/components/pages/dashboard/components/StatCard";
import { VersionBreakdown } from "@/components/pages/dashboard/components/VersionBreakdown";
import { EMULATORS } from "@/components/pages/emulators/constants/emulator.constants";
import { countByStatus } from "@/components/pages/emulators/utils/emulator.utils";

export function Dashboard() {
  const counts = countByStatus(EMULATORS);
  const hosts = new Set(EMULATORS.map((e) => e.host)).size;
  const runningShare = Math.round((counts.running / counts.all) * 100);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Health of your emulator fleet at a glance."
        actions={<DashboardActions />}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Total emulators"
          value={counts.all}
          hint={`Across ${hosts} hosts`}
          tone="neutral"
        />
        <StatCard
          label="Running"
          value={counts.running}
          hint={`${runningShare}% of the fleet · ${counts.booting} booting`}
          tone="running"
        />
        <StatCard label="Stopped" value={counts.stopped} hint="Ready to start" tone="stopped" />
        <StatCard label="Offline" value={counts.offline} hint="Needs attention" tone="offline" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SessionsChart className="lg:col-span-2" />
        <VersionBreakdown emulators={EMULATORS} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <RecentEmulators emulators={EMULATORS} className="lg:col-span-2" />
        <div className="flex flex-col gap-4">
          <ResourceUsage />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
