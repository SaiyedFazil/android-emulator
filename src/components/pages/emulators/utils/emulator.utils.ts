import type { StatusFilter } from "@/components/pages/emulators/constants/emulator.constants";
import type { Emulator } from "@/types/emulator.types";

/** Case-insensitive match on name, serial, model, host and address; then status. */
export function filterEmulators(list: Emulator[], query: string, status: StatusFilter): Emulator[] {
  const q = query.trim().toLowerCase();
  return list.filter((e) => {
    if (status !== "all" && e.status !== status) return false;
    if (!q) return true;
    return [e.name, e.serial, e.model, e.host, formatAddress(e)].some((v) =>
      v.toLowerCase().includes(q)
    );
  });
}

export function countByStatus(list: Emulator[]): Record<StatusFilter, number> {
  const counts: Record<StatusFilter, number> = {
    all: list.length,
    running: 0,
    booting: 0,
    stopped: 0,
    offline: 0,
  };
  for (const e of list) counts[e.status] += 1;
  return counts;
}

/** host:port, with IPv6 hosts bracketed — `[fd00::1a2b]:5582`. */
export function formatAddress({ host, port }: Pick<Emulator, "host" | "port">): string {
  return host.includes(":") ? `[${host}]:${port}` : `${host}:${port}`;
}
