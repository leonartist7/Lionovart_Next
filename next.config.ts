import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A second lockfile exists in the Windows user profile. Pin Turbopack to
  // this repository so builds never walk outside the workspace sandbox.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Keep unoptimized for Cloud Run / static asset path simplicity;
    // remote media is already optimized via Cloudinary transforms.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
