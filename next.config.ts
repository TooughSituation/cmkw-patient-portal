import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Isolate from parent monorepo/workspace (akwen-web) lockfile detection
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
