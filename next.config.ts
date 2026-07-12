import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/running",
        destination: "/fitness",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
