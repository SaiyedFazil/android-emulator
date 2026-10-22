import { notFound } from "next/navigation";

import { RoutedTabs } from "@/components/custom/RoutedTabs";
import { ORGANIZATIONS } from "@/components/pages/admin/organizations/constants/organization.constants";
import { OrganizationHeader } from "@/components/pages/admin/organizations/detail/OrganizationHeader";
import {
  emulatorsOf,
  getOrganization,
  invoicesOf,
  membersOf,
} from "@/components/pages/admin/utils/admin.selectors";

// The first visit to an unlisted id must wait for the full render: served from the App Shell, it
// would stream with a 200 before notFound() runs. (`dynamicParams` isn't available with Cache
// Components.)
export const ensureStatic = "navigation";

// Prerender every known organization; unknown ids reach notFound() at request time.
export function generateStaticParams() {
  return ORGANIZATIONS.map((org) => ({ orgId: org.id }));
}

/** Header and tab bar shared by an organization's tabs; each tab is its own page below. */
export default async function OrganizationLayout({
  children,
  params,
}: LayoutProps<"/admin/organizations/[orgId]">) {
  const { orgId } = await params;
  const org = getOrganization(orgId);
  if (!org) notFound();

  const base = `/admin/organizations/${org.id}`;
  return (
    <div className="flex flex-col gap-6">
      <OrganizationHeader org={org} />
      <RoutedTabs
        label={`${org.name} sections`}
        tabs={[
          { href: base, label: "Overview", exact: true },
          { href: `${base}/users`, label: "Users", count: membersOf(org.id).length },
          { href: `${base}/emulators`, label: "Emulators", count: emulatorsOf(org.id).length },
          { href: `${base}/billing`, label: "Billing", count: invoicesOf(org.id).length },
          { href: `${base}/activity`, label: "Activity" },
        ]}
      />
      {children}
    </div>
  );
}
