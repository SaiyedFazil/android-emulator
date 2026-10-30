import dayjs, { type ConfigType } from "@/lib/dayjs";

/**
 * Browsers and Node list a few zones under names that have since changed (CLDR keeps the old
 * spelling). Both names work everywhere; these show the current one.
 */
const CURRENT_NAMES: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Rangoon": "Asia/Yangon",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "Atlantic/Faeroe": "Atlantic/Faroe",
  "Europe/Kiev": "Europe/Kyiv",
  "Pacific/Enderbury": "Pacific/Kanton",
  "Pacific/Ponape": "Pacific/Pohnpei",
  "Pacific/Truk": "Pacific/Chuuk",
};

export function currentZoneName(zone: string): string {
  return CURRENT_NAMES[zone] ?? zone;
}

/** Every IANA time zone the browser knows, by its current name, plus UTC. */
function allZones(): string[] {
  const zones = Intl.supportedValuesOf("timeZone").map(currentZoneName);
  return [...new Set(["UTC", ...zones])];
}

export interface TimeZoneOption {
  /** IANA name, e.g. "Asia/Kolkata" — what is saved. */
  value: string;
  /** "(UTC+05:30) Asia/Kolkata". */
  label: string;
  /** "India Standard Time". */
  longName: string;
  offsetMinutes: number;
}

/** One zone as shown at `at` (offsets change with daylight saving time). */
export function timeZoneOption(zone: string, at: ConfigType): TimeZoneOption {
  const time = dayjs(at).tz(zone);
  return {
    value: zone,
    label: `(UTC${time.format("Z")}) ${zone.replaceAll("_", " ")}`,
    longName: time.format("zzz"),
    offsetMinutes: time.utcOffset(),
  };
}

/** All zones at `at`, west to east, then by name; `include` is added if the list lacks it. */
export function timeZoneOptions(at: ConfigType, include?: string): TimeZoneOption[] {
  const zones = allZones();
  if (include && !zones.includes(include)) zones.push(include);
  return zones
    .map((zone) => timeZoneOption(zone, at))
    .sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.value.localeCompare(b.value));
}
