import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/event",
  assetPrefix: "/event",
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: "/event",
  },
};

export default nextConfig;
