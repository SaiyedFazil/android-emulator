export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  /** Display label: the organization role in the console, the access level in admin. */
  roleLabel: string;
  phone?: string;
  timezone: string;
  /** ISO 8601 timestamp */
  joinedAt: string;
  /** ISO 8601 timestamp */
  passwordChangedAt: string;
}

export interface SignInEvent {
  id: string;
  device: string;
  kind: "desktop" | "mobile";
  location: string;
  ip: string;
  /** ISO 8601 timestamp */
  at: string;
  current?: boolean;
}
