import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/** The API's origin: the only other server the browser may send requests to. */
const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1").origin;

/**
 * This machine's network address (e.g. 192.168.1.2) when the dev server is opened from other
 * devices; set in `.env.local`, empty otherwise. Next.js only serves its dev resources to hosts it
 * is told about, and the browser opens the hot-reload WebSocket on port 5000 (`npm run dev`).
 */
const devHost = isDev ? process.env.DEV_HOST?.trim() || null : null;
const devSockets = devHost ? ` ws://localhost:5000 ws://${devHost}:5000` : "";

/**
 * Content-Security-Policy: the browser runs only this site's scripts and talks only to this site
 * and the API, so an injected script can neither load from elsewhere nor send the access token
 * out. Inline scripts stay allowed: prerendered pages carry Next.js's inline bootstrap and the
 * theme script, and a per-request nonce would make every page dynamic. Development also needs
 * `eval` (React's dev tooling).
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin}${devSockets}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Older browsers' equivalent of frame-ancestors: no other site may frame these pages.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  ...(devHost ? { allowedDevOrigins: [devHost] } : {}),
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: { position: "bottom-right" },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/", destination: "/dashboard", permanent: false },
      { source: "/admin", destination: "/admin/dashboard", permanent: false },
    ];
  },
  turbopack: {
    // Pin the root: a package.json in the user's home directory would otherwise be picked up.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
