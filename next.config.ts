import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: { position: "bottom-right" },
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
