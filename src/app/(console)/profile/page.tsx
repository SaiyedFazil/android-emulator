import type { Metadata } from "next";

import { PROFILE, SIGN_INS } from "@/components/pages/profile/constants/profile.constants";
import { Profile } from "@/components/pages/profile/Profile";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return <Profile profile={PROFILE} signIns={SIGN_INS} />;
}
