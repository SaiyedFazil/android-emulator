import { CirclePause, CircleX, Play, Smartphone } from "lucide-react";

import { PageHeader } from "@/components/custom/PageHeader";
import { StatCard } from "@/components/custom/StatCard";
import { FLEET_EMULATORS } from "@/components/pages/admin/emulators/constants/fleet.constants";
import { ORGANIZATIONS } from "@/components/pages/admin/organizations/constants/organization.constants";
import { FleetEmulatorsTable } from "@/components/pages/admin/shared/FleetEmulatorsTable";
import { fleetCapacity } from "@/components/pages/admin/utils/admin.selectors";

export function FleetEmulators() {
  const count = (status: string) => FLEET_EMULATORS.filter((e) => e.status === status).length;
  const capacity = fleetCapacity();
  const orgsWithEmulators = new Set(FLEET_EMULATORS.map((e) => e.orgId)).size;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Emulators"
        description="Every emulator on every host, across all organizations."
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Emulators"
          value={FLEET_EMULATORS.length}
          hint={`In ${orgsWithEmulators} of ${ORGANIZATIONS.length} organizations`}
          icon={<Smartphone />}
        />
        <StatCard
          label="Running"
          value={count("running")}
          hint={`+${count("booting")} booting · ${capacity.used} of ${capacity.total} slots used`}
          icon={<Play />}
        />
        <StatCard
          label="Stopped"
          value={count("stopped")}
          hint="Ready to start"
          icon={<CirclePause />}
        />
        <StatCard
          label="Offline"
          value={count("offline")}
          hint="Host unreachable"
          icon={<CircleX />}
        />
      </div>
      <FleetEmulatorsTable emulators={FLEET_EMULATORS} showOrganization />
    </div>
  );
}
