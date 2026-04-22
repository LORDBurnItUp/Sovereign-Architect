import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force webpack bundler — Turbopack crashes on resource-constrained VPS environments
  turbopack: undefined,
  experimental: {
    turbopack: false,
  },
};

export default nextConfig;
