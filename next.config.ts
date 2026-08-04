import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.meaco.com",
      },
      {
        protocol: "https",
        hostname: "meaco.com",
      },
      {
        protocol: "https",
        hostname: "probreeze.com",
      },
      {
        protocol: "https",
        hostname: "www.probreeze.com",
      },
    ],
  },
};

export default nextConfig;
