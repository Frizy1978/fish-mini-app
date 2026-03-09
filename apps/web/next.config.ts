import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fominiapp/shared"],
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fisholha.ru",
        pathname: "/wp-content/uploads/**"
      },
      {
        protocol: "https",
        hostname: "www.fisholha.ru",
        pathname: "/wp-content/uploads/**"
      }
    ]
  }
};

export default nextConfig;
