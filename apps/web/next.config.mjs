import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@techinsights/database'],
  outputFileTracingRoot: path.resolve(process.cwd(), '../../'),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
