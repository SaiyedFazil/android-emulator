/** The API's roles: platform staff (`OWNER`, `ADMIN`, `SUPPORT`) and organization users. */
export type ApiRole = "OWNER" | "ADMIN" | "SUPPORT" | "ORGANIZATION_ADMIN" | "MEMBER";

export type UserStatus = "INVITED" | "ACTIVE" | "SUSPENDED";

export type DeviceType = "DESKTOP" | "MOBILE" | "TABLET";

/** What sign-in and refresh return. */
export interface TokenPair {
  accessToken: string;
  /** Seconds until the access token expires. */
  accessTokenExpiresIn: number;
  refreshToken: string;
  /** ISO 8601 timestamp. */
  refreshTokenExpiresAt: string;
  persistent: boolean;
}

/** The signed-in user, as sign-in returns it. */
export interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  firstName: string;
  lastName: string;
  role: ApiRole;
  status: UserStatus;
  organization: { id: string; name: string } | null;
}

/** `GET /me`: the user plus their profile. */
export interface Me extends AuthUser {
  phone: string | null;
  /** IANA time zone name. */
  timezone: string;
  /** ISO 8601 timestamp; null if the password was never set. */
  passwordChangedAt: string | null;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

/** One signed-in device, from `GET /auth/sessions`. */
export interface ApiSession {
  id: string;
  deviceName: string | null;
  deviceType: DeviceType | null;
  location: string | null;
  ipAddress: string | null;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp. */
  lastUsedAt: string;
  /** The session making the request. */
  isCurrent: boolean;
}
