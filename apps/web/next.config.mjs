/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: process.env.CI ? false : true,
  transpilePackages: ['@pasok/config', '@pasok/domain', '@pasok/database', '@pasok/queue', '@pasok/auth-kyb-service', '@pasok/repository-contracts', '@pasok/security'],
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    webUrl: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 300,
        ignored: /node_modules[\\/](?!@pasok)/,
      };
    }
    return config;
  },
};

export default nextConfig;
