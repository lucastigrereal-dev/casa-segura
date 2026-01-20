/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ['@casa-segura/shared', '@casa-segura/database'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};
