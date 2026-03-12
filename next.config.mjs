/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/POS-restaurante',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

// Verification: Force deployment after Pages setup
