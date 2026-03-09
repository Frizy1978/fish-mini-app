import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fominiapp/shared"],
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
