import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrganizationUsers } from "@/components/pages/admin/organizations/detail/users/OrganizationUsers";
import { getOrganization } from "@/components/pages/admin/utils/admin.selectors";

export async function generateMetadata({
  params,
}: PageProps<"/admin/organizations/[orgId]/users">): Promise<Metadata> {
  const { orgId } = await params;
  const org = getOrganization(orgId);
  return { title: org ? `${org.name} · Users` : "Users" };
}

export default async function OrganizationUsersPage({
  params,
}: PageProps<"/admin/organizations/[orgId]/users">) {
  const { orgId } = await params;
  if (!getOrganization(orgId)) notFound();
  return <OrganizationUsers orgId={orgId} />;
}
