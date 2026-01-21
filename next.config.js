/** @type {import('next').NextConfig} */
const path = require('path');

module.exports = {
  // Point to the web-pro app
  webpackPath: path.resolve(__dirname, 'apps/web-pro'),
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
