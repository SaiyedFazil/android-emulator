import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UserDetail } from "@/components/pages/admin/users/detail/UserDetail";
import { getMember } from "@/components/pages/admin/utils/admin.selectors";

// A dynamic route rendered on request, as on organization pages: nothing is prerendered per user.
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/admin/users/[userId]">): Promise<Metadata> {
  const { userId } = await params;
  return { title: getMember(userId)?.name ?? "User" };
}

export default async function UserDetailPage({ params }: PageProps<"/admin/users/[userId]">) {
  const { userId } = await params;
  const member = getMember(userId);
  if (!member) notFound();
  return <UserDetail member={member} />;
}
