import { Gauge, HeartPulse, Server } from "lucide-react";

import { PageHeader } from "@/components/custom/PageHeader";
import { StatCard } from "@/components/custom/StatCard";
import { AddHostButton } from "@/components/pages/admin/hosts/components/HostActions";
import { HostCard } from "@/components/pages/admin/hosts/components/HostCard";
import { HOSTS } from "@/components/pages/admin/hosts/constants/host.constants";
import { fleetCapacity } from "@/components/pages/admin/utils/admin.selectors";

export function Hosts() {
  const healthy = HOSTS.filter((h) => h.status === "healthy").length;
  const capacity = fleetCapacity();
  const percent = Math.round((capacity.used / capacity.total) * 100);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hosts"
        description="The machines emulators run on: health, load and free slots."
        actions={<AddHostButton />}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <StatCard
          label="Healthy hosts"
          value={`${healthy} / ${HOSTS.length}`}
          hint={`${HOSTS.length - healthy} need attention`}
          icon={<HeartPulse />}
        />
        <StatCard
          label="Slots online"
          value={capacity.total}
          hint="On reachable hosts"
          icon={<Server />}
        />
        <StatCard
          label="Slots in use"
          value={capacity.used}
          hint={`${percent}% of online capacity`}
          icon={<Gauge />}
          className="col-span-2 xl:col-span-1"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {HOSTS.map((host) => (
          <HostCard key={host.id} host={host} />
        ))}
      </div>
    </div>
  );
}
