export type UserRole = "Administrator" | "Operator" | "Viewer";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
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
