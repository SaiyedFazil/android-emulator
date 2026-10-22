import type { Plan } from "@/types/admin.types";

// TODO(api): plans come from the billing backend. Tiers differ only by concurrent emulators.
export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Try the console with a single emulator.",
    priceMonthly: 0,
    concurrentEmulators: 1,
    status: "active",
    visible: true,
  },
  {
    id: "starter",
    name: "Starter",
    description: "For developers testing on a handful of devices.",
    priceMonthly: 1900,
    concurrentEmulators: 3,
    status: "active",
    visible: true,
  },
  {
    id: "team",
    name: "Team",
    description: "For QA teams running suites in parallel.",
    priceMonthly: 4900,
    concurrentEmulators: 10,
    status: "active",
    visible: true,
  },
  {
    id: "business",
    name: "Business",
    description: "For product teams with continuous test pipelines.",
    priceMonthly: 12900,
    concurrentEmulators: 25,
    status: "active",
    visible: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Dedicated capacity, custom terms and priority support.",
    priceMonthly: null,
    concurrentEmulators: 50,
    status: "active",
    visible: false,
  },
];

/** Yearly billing costs ten months: two months free. */
export const YEARLY_MONTHS = 10;
