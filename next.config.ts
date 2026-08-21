import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server accept requests when loaded from a LAN IP (e.g.
  // testing on a phone via http://10.0.0.56:3000) instead of just localhost.
  allowedDevOrigins: ["10.0.0.56"],
};

export default nextConfig;
