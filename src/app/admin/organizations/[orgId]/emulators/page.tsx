import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FleetEmulatorsTable } from "@/components/pages/admin/shared/FleetEmulatorsTable";
import { emulatorsOf, getOrganization } from "@/components/pages/admin/utils/admin.selectors";

export async function generateMetadata({
  params,
}: PageProps<"/admin/organizations/[orgId]/emulators">): Promise<Metadata> {
  const { orgId } = await params;
  const org = getOrganization(orgId);
  return { title: org ? `${org.name} · Emulators` : "Emulators" };
}

export default async function OrganizationEmulatorsPage({
  params,
}: PageProps<"/admin/organizations/[orgId]/emulators">) {
  const { orgId } = await params;
  if (!getOrganization(orgId)) notFound();
  return <FleetEmulatorsTable emulators={emulatorsOf(orgId)} />;
}
