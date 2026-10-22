import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrganizationBilling } from "@/components/pages/admin/organizations/detail/billing/OrganizationBilling";
import { getOrganization } from "@/components/pages/admin/utils/admin.selectors";

export async function generateMetadata({
  params,
}: PageProps<"/admin/organizations/[orgId]/billing">): Promise<Metadata> {
  const { orgId } = await params;
  const org = getOrganization(orgId);
  return { title: org ? `${org.name} · Billing` : "Billing" };
}

export default async function OrganizationBillingPage({
  params,
}: PageProps<"/admin/organizations/[orgId]/billing">) {
  const { orgId } = await params;
  const org = getOrganization(orgId);
  if (!org) notFound();
  return <OrganizationBilling org={org} />;
}
