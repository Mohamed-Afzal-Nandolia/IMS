import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Fix barrel import performance for icon/chart libraries (rule: bundle-barrel-imports)
    // react-icons has thousands of re-exports loading unused modules without this
    optimizePackageImports: ['react-icons', 'recharts', 'framer-motion'],
  },
};

export default nextConfig;
