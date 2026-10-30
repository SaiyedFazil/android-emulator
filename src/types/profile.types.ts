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
