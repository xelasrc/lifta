import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server accept requests when loaded from a LAN IP (e.g.
  // testing on a phone via http://10.0.0.56:3000) instead of just localhost.
  allowedDevOrigins: ["10.0.0.56"],
  async headers() {
    return [
      {
        // Always revalidate the service worker itself so updates roll out
        // promptly instead of being stuck behind stale HTTP caching.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

export default nextConfig;
