import { MonitorSmartphone, ShieldCheck, UserRound } from "lucide-react";

import { SectionTabs, type SectionTab } from "@/components/custom/SectionTabs";
import { PersonalDetailsForm } from "@/components/pages/profile/components/PersonalDetailsForm";
import { ProfileHeader } from "@/components/pages/profile/components/ProfileHeader";
import { SecurityCard } from "@/components/pages/profile/components/SecurityCard";
import { SignInActivity } from "@/components/pages/profile/components/SignInActivity";
import type { SignInEvent, UserProfile } from "@/types/profile.types";

/** The signed-in person's own account — used by the console and the admin console alike. */
export function Profile({ profile, signIns }: { profile: UserProfile; signIns: SignInEvent[] }) {
  const tabs: SectionTab[] = [
    {
      value: "personal",
      label: "Personal details",
      description: "Name, email and time zone",
      icon: <UserRound />,
      content: <PersonalDetailsForm profile={profile} />,
    },
    {
      value: "security",
      label: "Password & security",
      description: "Password and two-factor",
      icon: <ShieldCheck />,
      content: <SecurityCard passwordChangedAt={profile.passwordChangedAt} />,
    },
    {
      value: "devices",
      label: "Devices",
      description: "Where you're signed in",
      icon: <MonitorSmartphone />,
      content: <SignInActivity events={signIns} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader profile={profile} />
      <SectionTabs tabs={tabs} label="Profile sections" />
    </div>
  );
}
