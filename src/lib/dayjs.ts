/**
 * The app's one dayjs, with the plugins every date needs: UTC, IANA time zones, relative times
 * and zone names in formats (`zzz` → "India Standard Time"). Import dayjs from here, never from
 * "dayjs" directly, so the plugins are always loaded.
 */
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

export default dayjs;
export type { ConfigType, Dayjs } from "dayjs";
