import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The sandbox preview serves the dev server through https://<port>-<sandbox>.e2b.app.
  // Next blocks dev asset/HMR requests from origins it does not recognise, which
  // breaks the proxied preview, so the preview hosts are allowed explicitly here.
  allowedDevOrigins: ["*.e2b.app", "*.vercel.app", "localhost", "127.0.0.1"],
  images: {
    // Artwork is hosted externally (ImgBB direct URLs, Steam CDN, etc.).
    // Hosts are whitelisted at runtime via remotePatterns so any HTTPS host works
    // for plain <img> usage; next/image stays limited to the hosts below.
    remotePatterns: [
      { protocol: "https", hostname: "**.ibb.co" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "**.steamstatic.com" },
      { protocol: "https", hostname: "**.akamai.steamstatic.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
