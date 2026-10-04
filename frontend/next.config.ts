import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
