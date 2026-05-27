import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Story thumbnails come from many external sources; next/image fetches + optimises them
    // server-side so the visitor never calls a third-party host (privacy + speed). Broken
    // images fall back to a placeholder in NewsCard. Hardening option: restrict to known
    // source domains, or have n8n upload thumbnails to Supabase Storage (first-party only).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
