export interface NavItem {
  title: string;
  href: string;
  /** A rendered icon element, e.g. `<Users />` — elements can cross the server/client boundary. */
  icon: React.ReactNode;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface ShellNotification {
  id: string;
  title: string;
  time: string;
  unread: boolean;
}

/**
 * Everything the app shell (sidebar, navbar, breadcrumb) shows for one area of the app. Each
 * area's server layout passes its own config, so one area's data never ships with the other.
 */
export interface ShellConfig {
  homeHref: string;
  tagline: string;
  /** Pill beside the product name, e.g. "Admin". */
  badge?: string;
  /** First breadcrumb, e.g. "Admin". */
  breadcrumbRoot?: string;
  nav: NavGroup[];
  search: { label: string; placeholder: string };
  notifications: ShellNotification[];
  capacity: { label: string; used: number; total: number };
  user: { name: string; email: string; initials: string; role: string };
  profileHref: string;
  settingsHref: string;
  /** id → display name for dynamic route segments, used by the breadcrumb. */
  entityNames?: Record<string, string>;
}
