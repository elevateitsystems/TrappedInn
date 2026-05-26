import type { NextConfig } from "next";

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverActions: {
    // Increase limit to 10 MB for avatar/header uploads
    bodysizelimit: 10_000_000,
  },
};

export default nextConfig;

