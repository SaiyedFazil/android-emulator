import { MonitorSmartphone, ShieldCheck, UserRound } from "lucide-react";

import { SectionTabs, type SectionTab } from "@/components/custom/SectionTabs";
import { PersonalDetailsForm } from "@/components/pages/profile/components/PersonalDetailsForm";
import { ProfileHeader } from "@/components/pages/profile/components/ProfileHeader";
import { SecurityCard } from "@/components/pages/profile/components/SecurityCard";
import { SignInActivity } from "@/components/pages/profile/components/SignInActivity";
import { PROFILE, SIGN_INS } from "@/components/pages/profile/constants/profile.constants";

const TABS: SectionTab[] = [
  {
    value: "personal",
    label: "Personal details",
    description: "Name, email and time zone",
    icon: <UserRound />,
    content: <PersonalDetailsForm profile={PROFILE} />,
  },
  {
    value: "security",
    label: "Password & security",
    description: "Password and two-factor",
    icon: <ShieldCheck />,
    content: <SecurityCard passwordChangedAt={PROFILE.passwordChangedAt} />,
  },
  {
    value: "devices",
    label: "Devices",
    description: "Where you're signed in",
    icon: <MonitorSmartphone />,
    content: <SignInActivity events={SIGN_INS} />,
  },
];

export function Profile() {
  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader profile={PROFILE} />
      <SectionTabs tabs={TABS} label="Profile sections" />
    </div>
  );
}
