import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This calculator is entirely client-side. Exporting static HTML avoids an
  // unnecessary server and keeps the public calculator fast and stable.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
