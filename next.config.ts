import type { NextConfig } from "next";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
const resolvedApiUrl =
  rawApiUrl && !rawApiUrl.includes("onrender.com")
    ? rawApiUrl
    : "https://srv2072247.hstgr.cloud/eventeset";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: resolvedApiUrl,
  },
};

export default nextConfig;
