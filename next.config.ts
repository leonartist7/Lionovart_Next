import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
