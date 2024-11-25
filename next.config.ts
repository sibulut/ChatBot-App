import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  webpack: (config: Configuration) => {
    config.cache = false; // Disable caching
    return config;
  },
};

export default nextConfig;