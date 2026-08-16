import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/eisenhower",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/eisenhower",
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
