/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: import.meta.dirname,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 88],
    // Uploaded media is served from /uploads on the same origin.
    remotePatterns: [],
  },
  experimental: {
    serverActions: { bodySizeLimit: '8mb' },
  },
  poweredByHeader: false,
};

export default nextConfig;
