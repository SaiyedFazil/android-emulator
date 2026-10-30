import { MonitorSmartphone, ShieldCheck, UserRound } from "lucide-react";

import { SectionTabs, type SectionTab } from "@/components/custom/SectionTabs";
import { Devices } from "@/components/pages/profile/components/Devices";
import { PersonalDetailsForm } from "@/components/pages/profile/components/PersonalDetailsForm";
import { ProfileHeader } from "@/components/pages/profile/components/ProfileHeader";
import { SecurityCard } from "@/components/pages/profile/components/SecurityCard";

/** The signed-in person's own account — used by the console and the admin console alike. */
export function Profile() {
  const tabs: SectionTab[] = [
    {
      value: "personal",
      label: "Personal details",
      description: "Name, phone and time zone",
      icon: <UserRound />,
      content: <PersonalDetailsForm />,
    },
    {
      value: "security",
      label: "Password & security",
      description: "Password and reset link",
      icon: <ShieldCheck />,
      content: <SecurityCard />,
    },
    {
      value: "devices",
      label: "Devices",
      description: "Where you're signed in",
      icon: <MonitorSmartphone />,
      content: <Devices />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader />
      <SectionTabs tabs={tabs} label="Profile sections" />
    </div>
  );
}
