import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // Allow isolated verification alongside another developer's running server.
  distDir: process.env.NEXT_BUILD_DIR || ".next",
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

export default withNextIntl(nextConfig);
