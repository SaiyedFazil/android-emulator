import type { ProfileFields } from "@/lib/api/me/me-api";
import { areaRoleOf } from "@/lib/auth/roles";
import type { ApiRole, Me } from "@/types/auth.types";

const ROLE_LABELS: Record<ApiRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  SUPPORT: "Support",
  ORGANIZATION_ADMIN: "Organization admin",
  MEMBER: "Member",
};

/** The role and where it applies: "Owner · Admin console", "Member · Northwind Labs". */
export function roleLabel(me: Pick<Me, "role" | "organization">): string {
  const where = areaRoleOf(me.role) === "admin" ? "Admin console" : me.organization?.name;
  return where ? `${ROLE_LABELS[me.role]} · ${where}` : ROLE_LABELS[me.role];
}

/** The profile form's values: every field a string, as the inputs hold them. */
export type ProfileFormValues = { [K in keyof ProfileFields]: string };

export function profileFormValues(me: Me): ProfileFormValues {
  return {
    firstName: me.firstName,
    lastName: me.lastName,
    phone: me.phone ?? "",
    timezone: me.timezone,
  };
}

/** Only the fields that changed, as the API takes them (trimmed; an empty phone is `null`). */
export function profilePatch(saved: Me, form: ProfileFormValues): Partial<ProfileFields> {
  const next: ProfileFields = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    phone: form.phone.trim() || null,
    timezone: form.timezone,
  };
  const patch: Partial<ProfileFields> = {};
  for (const key of Object.keys(next) as (keyof ProfileFields)[]) {
    if (next[key] !== saved[key]) Object.assign(patch, { [key]: next[key] });
  }
  return patch;
}
