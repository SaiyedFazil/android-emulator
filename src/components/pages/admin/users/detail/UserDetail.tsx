import Link from "next/link";
import { Clock, MonitorSmartphone, Repeat, Smartphone } from "lucide-react";

import { ChartCard } from "@/components/custom/ChartCard";
import { DetailList } from "@/components/custom/DetailList";
import { EmptyState } from "@/components/custom/EmptyState";
import { EntityAvatar } from "@/components/custom/EntityAvatar";
import { StatCard } from "@/components/custom/StatCard";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { MEMBER_STATUS, ORG_ROLE } from "@/components/pages/admin/constants/status.constants";
import { FLEET_EMULATORS } from "@/components/pages/admin/emulators/constants/fleet.constants";
import { FleetEmulatorsTable } from "@/components/pages/admin/shared/FleetEmulatorsTable";
import { MEMBER_SIGN_INS } from "@/components/pages/admin/users/constants/member-signins.constants";
import { UserAdminActions } from "@/components/pages/admin/users/detail/UserAdminActions";
import {
  getOrganization,
  memberEmulatorsRunning,
} from "@/components/pages/admin/utils/admin.selectors";
import { SignInActivity } from "@/components/pages/profile/components/SignInActivity";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";
import type { Member } from "@/types/admin.types";

export function UserDetail({ member }: { member: Member }) {
  const org = getOrganization(member.orgId);
  const status = MEMBER_STATUS[member.status];
  const role = ORG_ROLE[member.orgRole];
  const signIns = MEMBER_SIGN_INS[member.id] ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex min-w-0 items-center gap-4">
        <EntityAvatar name={member.name} size="lg" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1
            className="truncate text-2xl font-semibold tracking-tight md:text-[26px]"
            title={member.name}
          >
            {member.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <ToneBadge tone={status.tone} label={status.label} />
            <ToneBadge tone={role.tone} label={role.label} dot={false} />
            <span className="min-w-0 truncate" title={member.email}>
              {member.email}
            </span>
            {org ? (
              <>
                <span aria-hidden="true">·</span>
                <Link
                  href={`/admin/organizations/${org.id}`}
                  className="text-primary hover:underline"
                >
                  {org.name}
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Emulators now"
          value={memberEmulatorsRunning(member.id)}
          hint="Running or booting"
          icon={<Smartphone />}
        />
        <StatCard
          label="Hours this month"
          value={member.hoursThisMonth}
          hint="Emulator time"
          icon={<Clock />}
        />
        <StatCard
          label="Sessions this month"
          value={member.sessionsThisMonth}
          hint="Emulator starts"
          icon={<Repeat />}
        />
        <StatCard
          label="Last active"
          // A phrase, not a number: plain text at a size that fits a phone tile.
          value={
            <span className="font-sans text-lg font-semibold sm:text-xl">
              {member.lastActiveAt ? formatRelativeTime(member.lastActiveAt, SAMPLE_NOW) : "Never"}
            </span>
          }
          hint={member.lastActiveAt ? formatDate(member.lastActiveAt) : "Hasn't signed in"}
          icon={<MonitorSmartphone />}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <ChartCard title="Profile">
            <DetailList
              columns={2}
              items={[
                { label: "Email", value: member.email },
                {
                  label: "Organization",
                  value: org ? (
                    <Link
                      href={`/admin/organizations/${org.id}`}
                      className="text-primary hover:underline"
                    >
                      {org.name}
                    </Link>
                  ) : (
                    "—"
                  ),
                },
                { label: "Role", value: role.label },
                { label: "Status", value: status.label },
                { label: "Joined", value: formatDate(member.joinedAt) },
                { label: "Two-factor", value: member.twoFactor ? "On" : "Off" },
                { label: "User ID", value: member.id, mono: true },
              ]}
            />
          </ChartCard>
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Emulators</h2>
            <FleetEmulatorsTable
              emulators={FLEET_EMULATORS.filter((e) => e.ownerId === member.id)}
              showOwner={false}
              emptyTitle="No emulators"
              emptyDescription={`${member.name.split(" ")[0]} hasn't started an emulator recently.`}
            />
          </div>
          {signIns.length ? (
            <SignInActivity
              events={signIns}
              title="Sign-in activity"
              description="Devices and places this user signed in from."
            />
          ) : (
            <ChartCard title="Sign-in activity">
              <EmptyState
                icon={<MonitorSmartphone />}
                title="No recent sign-ins"
                description="Sign-ins from the last 30 days appear here."
                className="py-8"
              />
            </ChartCard>
          )}
        </div>
        <UserAdminActions member={member} />
      </div>
    </div>
  );
}
