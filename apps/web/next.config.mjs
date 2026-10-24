/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pasok/config', '@pasok/domain', '@pasok/database', '@pasok/queue', '@pasok/auth-kyb-service', '@pasok/repository-contracts', '@pasok/security'],
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
