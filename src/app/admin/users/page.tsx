import type { Metadata } from "next";

import { Users } from "@/components/pages/admin/users/Users";

export const metadata: Metadata = { title: "Users" };

export default function UsersPage() {
  return <Users />;
}
