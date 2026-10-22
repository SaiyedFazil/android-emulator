import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrganizationOverview } from "@/components/pages/admin/organizations/detail/overview/OrganizationOverview";
import { getOrganization } from "@/components/pages/admin/utils/admin.selectors";

export async function generateMetadata({
  params,
}: PageProps<"/admin/organizations/[orgId]">): Promise<Metadata> {
  const { orgId } = await params;
  return { title: getOrganization(orgId)?.name ?? "Organization" };
}

export default async function OrganizationOverviewPage({
  params,
}: PageProps<"/admin/organizations/[orgId]">) {
  const { orgId } = await params;
  const org = getOrganization(orgId);
  if (!org) notFound();
  return <OrganizationOverview org={org} />;
}
