/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow Colyseus WebSocket server on different port
  async rewrites() {
    return [
      {
        source: "/colyseus/:path*",
        destination: "http://localhost:2567/:path*",
      },
    ];
  },
  // Phaser requires client-side only
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },
};

export default nextConfig;
