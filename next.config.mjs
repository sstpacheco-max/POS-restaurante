/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: isGithubPages ? 'export' : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  basePath: isGithubPages ? '/POS-restaurante' : '',
  trailingSlash: isGithubPages ? true : false,
  images: {
    unoptimized: true,
  },
};

// Force redeploy - Timestamp: 2026-03-12 11:35
export default nextConfig;
