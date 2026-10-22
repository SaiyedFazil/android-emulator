import type { Metadata } from "next";

import {
  ADMIN_PROFILE,
  ADMIN_SIGN_INS,
} from "@/components/pages/admin/profile/constants/admin-profile.constants";
import { Profile } from "@/components/pages/profile/Profile";

export const metadata: Metadata = { title: "Profile" };

export default function AdminProfilePage() {
  return <Profile profile={ADMIN_PROFILE} signIns={ADMIN_SIGN_INS} />;
}
