import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MEMBERS } from "@/components/pages/admin/users/constants/member.constants";
import { UserDetail } from "@/components/pages/admin/users/detail/UserDetail";
import { getMember } from "@/components/pages/admin/utils/admin.selectors";

// As on organization pages: an unlisted id must not stream a 200 from the App Shell before
// notFound() runs.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return MEMBERS.map((member) => ({ userId: member.id }));
}

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
