import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "videos.pexels.com" },
      { protocol: "https", hostname: "cdn.naturafoods.co.id" },
      { protocol: "https", hostname: "cdn.alvineitsolutions.com" },
      { protocol: "https", hostname: "api-naturafoods.alvineitsolutions.com" },
      { protocol: "https", hostname: "cdn-naturafoods.alvineitsolutions.com" },
      { protocol: "https", hostname: "pub-d6914c78edb04a0e8448bb9ba55d71f8.r2.dev" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  allowedDevOrigins: ["e87c-118-99-107-253.ngrok-free.app", "192.168.83.154"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
