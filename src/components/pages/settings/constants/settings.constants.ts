// TODO(api): settings are local-only until the settings endpoint exists.

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी (Hindi)" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
];

export const ANDROID_VERSIONS = [
  { value: "35", label: "Android 15 · API 35" },
  { value: "34", label: "Android 14 · API 34" },
  { value: "33", label: "Android 13 · API 33" },
  { value: "31", label: "Android 12 · API 31" },
];

export const RAM_OPTIONS = ["2", "4", "6", "8"];
export const CPU_OPTIONS = ["2", "4", "6", "8"];

export const NOTIFICATION_OPTIONS = [
  {
    id: "offline",
    label: "Emulator goes offline",
    description: "Alert when a running emulator stops responding.",
    defaultOn: true,
  },
  {
    id: "boot-failed",
    label: "Boot failures",
    description: "Alert when an emulator fails to finish booting.",
    defaultOn: true,
  },
  {
    id: "capacity",
    label: "Host capacity",
    description: "Warn when a host passes 85% CPU or memory.",
    defaultOn: true,
  },
  {
    id: "weekly",
    label: "Weekly summary",
    description: "A Monday email with last week's sessions and uptime.",
    defaultOn: false,
  },
];
