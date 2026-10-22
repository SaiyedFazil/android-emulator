// TODO(api): platform settings come from (and save to) the settings endpoint.

export const TIME_ZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "America/New_York", label: "US Eastern (ET)" },
  { value: "Asia/Kolkata", label: "India (IST, UTC+5:30)" },
];

export const TRIAL_LENGTHS = [7, 14, 30];
export const INVITE_EXPIRY_DAYS = [3, 7, 14];
export const GRACE_DAYS = [3, 7, 14];
export const SESSION_TIMEOUTS = [
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "8h", label: "8 hours" },
  { value: "24h", label: "24 hours" },
];
export const IDLE_STOP = [
  { value: "off", label: "Never" },
  { value: "15", label: "After 15 minutes" },
  { value: "30", label: "After 30 minutes" },
  { value: "60", label: "After 1 hour" },
];
export const MAX_SESSION = [
  { value: "4", label: "4 hours" },
  { value: "8", label: "8 hours" },
  { value: "24", label: "24 hours" },
  { value: "none", label: "No limit" },
];
export const ANDROID_VERSIONS = [
  { version: "15", api: 35, enabled: true },
  { version: "14", api: 34, enabled: true },
  { version: "13", api: 33, enabled: true },
  { version: "12", api: 31, enabled: false },
];

export const ADMIN_ALERTS = [
  {
    id: "failed-payment",
    label: "Failed payments",
    description: "When a charge fails or a subscription goes past due.",
    defaultOn: true,
  },
  {
    id: "host-offline",
    label: "Hosts offline or degraded",
    description: "When a host stops responding or crosses 90% memory.",
    defaultOn: true,
  },
  {
    id: "at-limit",
    label: "Organizations at their limit",
    description: "When an organization reaches or exceeds its plan.",
    defaultOn: true,
  },
  {
    id: "new-org",
    label: "New organizations",
    description: "Each time an organization is created or starts a trial.",
    defaultOn: false,
  },
  {
    id: "weekly",
    label: "Weekly revenue summary",
    description: "MRR, new customers and churn, every Monday.",
    defaultOn: true,
  },
];
