import { notFound } from "next/navigation";

import { RoutedTabs } from "@/components/custom/RoutedTabs";
import { OrganizationHeader } from "@/components/pages/admin/organizations/detail/OrganizationHeader";
import {
  emulatorsOf,
  getOrganization,
  invoicesOf,
  membersOf,
} from "@/components/pages/admin/utils/admin.selectors";

// A dynamic route: nothing is prerendered per organization; each id renders on request, ready for
// the API to supply it. Params are request data here, and `instant = false` lets this layout read
// them without a Suspense boundary. An unknown id shows the not-found page, with status 200 and
// `noindex` because the admin shell has already streamed (see CLAUDE.md).
export const instant = false;

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
