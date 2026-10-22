import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChartCard } from "@/components/custom/ChartCard";
import { AuditTimeline } from "@/components/pages/admin/shared/AuditTimeline";
import { auditFor, getOrganization } from "@/components/pages/admin/utils/admin.selectors";

export async function generateMetadata({
  params,
}: PageProps<"/admin/organizations/[orgId]/activity">): Promise<Metadata> {
  const { orgId } = await params;
  const org = getOrganization(orgId);
  return { title: org ? `${org.name} · Activity` : "Activity" };
}

export default async function OrganizationActivityPage({
  params,
}: PageProps<"/admin/organizations/[orgId]/activity">) {
  const { orgId } = await params;
  const org = getOrganization(orgId);
  if (!org) notFound();
  return (
    <ChartCard
      title="Activity"
      description="Everything admins, members and the platform did for this organization"
    >
      <AuditTimeline events={auditFor(org.id)} emptyTitle="No activity for this organization yet" />
    </ChartCard>
  );
}
