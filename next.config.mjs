/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pasok/config', '@pasok/domain', '@pasok/database', '@pasok/queue', '@pasok/auth-kyb-service'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
