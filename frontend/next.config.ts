import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright memakai folder build sendiri (.next-e2e) supaya test bisa jalan bersamaan dengan
  // `npm run dev`: Next hanya mengizinkan satu dev server per folder build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 502, 640, 768, 1024, 1280, 1440, 1920],
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/teams",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
