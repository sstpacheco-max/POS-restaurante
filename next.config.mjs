/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/POS-restaurante',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

// Force redeploy - Timestamp: 2026-03-12 11:35
export default nextConfig;
