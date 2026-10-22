import { HOSTS } from "@/components/pages/admin/hosts/constants/host.constants";
import { minutesAgo } from "@/lib/sample-time";
import type { FleetEmulator } from "@/types/admin.types";
import type { EmulatorStatus } from "@/types/emulator.types";

type Row = [
  orgId: string,
  ownerId: string,
  hostId: string,
  model: string,
  android: string,
  api: number,
  status: EmulatorStatus,
  cpu: number,
  ram: number,
  activeMinutesAgo: number,
];

// TODO(api): every emulator across all organizations, from the backend. Running and booting
// emulators fill their organization's plan slots and their host's capacity; the one on the
// offline host (ap-south-c2) is offline.
// prettier-ignore
const ROWS: Row[] = [
  ["org_northwind", "usr_priya", "host_a1", "Pixel 8 Pro", "15", 35, "running", 4, 8, 2],
  ["org_northwind", "usr_priya", "host_a1", "Pixel 9", "15", 35, "running", 4, 8, 5],
  ["org_northwind", "usr_ethan", "host_a1", "Galaxy S24", "14", 34, "running", 4, 8, 1],
  ["org_northwind", "usr_ethan", "host_a2", "Pixel Tablet", "14", 34, "running", 6, 8, 12],
  ["org_northwind", "usr_daniel", "host_a2", "Pixel 7a", "14", 34, "running", 2, 4, 9],
  ["org_northwind", "usr_mei", "host_a2", "Galaxy A55", "14", 34, "running", 4, 6, 3],
  ["org_northwind", "usr_jonas", "host_b1", "Pixel 6a", "13", 33, "running", 2, 4, 7],
  ["org_northwind", "usr_jonas", "host_b1", "Pixel 9 Pro Fold", "15", 35, "booting", 6, 12, 1],
  ["org_northwind", "usr_aisha", "host_b1", "Nexus 5X", "12", 31, "stopped", 2, 2, 340],
  ["org_northwind", "usr_ravi", "host_a1", "Pixel 8", "15", 35, "stopped", 4, 8, 1500],

  ["org_helix", "usr_marco", "host_b2", "Pixel 9", "15", 35, "running", 4, 8, 1],
  ["org_helix", "usr_marco", "host_b2", "Pixel 8 Pro", "15", 35, "running", 4, 8, 2],
  ["org_helix", "usr_giulia", "host_b2", "Galaxy S24", "14", 34, "running", 4, 8, 4],
  ["org_helix", "usr_giulia", "host_b2", "Galaxy S23", "14", 34, "running", 4, 8, 6],
  ["org_helix", "usr_samir", "host_b2", "Pixel 7", "14", 34, "running", 2, 6, 3],
  ["org_helix", "usr_samir", "host_b2", "Pixel 7a", "14", 34, "booting", 2, 4, 1],
  ["org_helix", "usr_yuki", "host_c1", "Pixel 6", "13", 33, "running", 2, 4, 8],
  ["org_helix", "usr_yuki", "host_c1", "Galaxy A54", "13", 33, "running", 4, 6, 11],
  ["org_helix", "usr_omar", "host_c1", "Pixel 8", "15", 35, "running", 4, 8, 2],
  ["org_helix", "usr_elena", "host_c1", "Pixel Fold", "14", 34, "running", 6, 12, 5],
  ["org_helix", "usr_elena", "host_c1", "Galaxy Tab S9", "14", 34, "running", 6, 8, 7],

  ["org_meridian", "usr_alexandria", "host_a1", "Pixel 9 Pro", "15", 35, "running", 6, 12, 3],
  ["org_meridian", "usr_benedikt", "host_a1", "Galaxy S24 Ultra", "14", 34, "running", 6, 12, 6],
  ["org_meridian", "usr_chiara", "host_a1", "Pixel Tablet", "14", 34, "running", 6, 8, 9],
  ["org_meridian", "usr_dmitri", "host_b1", "Pixel 8", "15", 35, "running", 4, 8, 2],
  ["org_meridian", "usr_esther", "host_b1", "Galaxy Z Flip5", "14", 34, "booting", 4, 8, 1],
  ["org_meridian", "usr_farah", "host_b1", "Pixel 7", "14", 34, "running", 2, 6, 14],
  ["org_meridian", "usr_gustavo", "host_c2", "Pixel 6a", "13", 33, "offline", 2, 4, 95],

  ["org_orbit", "usr_sofia", "host_a2", "Pixel 8 Pro", "15", 35, "running", 4, 8, 4],
  ["org_orbit", "usr_liam", "host_a2", "Galaxy S23", "14", 34, "running", 4, 8, 10],
  ["org_orbit", "usr_nora", "host_a2", "Pixel 7a", "14", 34, "running", 2, 4, 6],
  ["org_orbit", "usr_pablo", "host_a2", "Pixel 9", "15", 35, "booting", 4, 8, 1],
  ["org_orbit", "usr_quinn", "host_a2", "Nexus 5X", "12", 31, "stopped", 2, 2, 720],

  ["org_lumen", "usr_hannah", "host_c1", "Pixel 8", "15", 35, "running", 4, 8, 3],
  ["org_lumen", "usr_isaac", "host_c1", "Galaxy A55", "14", 34, "running", 4, 6, 15],
  ["org_lumen", "usr_julia", "host_c1", "Pixel 7", "14", 34, "running", 2, 6, 22],

  ["org_cascade", "usr_tomas", "host_b1", "Pixel 9 Pro", "15", 35, "running", 6, 12, 2],
  ["org_cascade", "usr_ugo", "host_b1", "Galaxy S24", "14", 34, "running", 4, 8, 5],
  ["org_cascade", "usr_vera", "host_b1", "Pixel 8a", "15", 35, "running", 4, 8, 8],

  ["org_pixelforge", "usr_kai", "host_a1", "Pixel 8a", "15", 35, "running", 4, 8, 4],
];

const HOST_IP = Object.fromEntries(HOSTS.map((h) => [h.id, h.ip]));

export const FLEET_EMULATORS: FleetEmulator[] = ROWS.map(
  ([orgId, ownerId, hostId, model, androidVersion, apiLevel, status, cpu, ram, ago], i) => {
    const port = 5554 + i * 2;
    return {
      id: `fe_${String(i + 1).padStart(2, "0")}`,
      name: model,
      serial: `emulator-${port}`,
      model,
      androidVersion,
      apiLevel,
      status,
      host: HOST_IP[hostId],
      port,
      cpuCores: cpu,
      ramGb: ram,
      lastActive: minutesAgo(ago),
      orgId,
      ownerId,
      hostId,
    };
  }
);
