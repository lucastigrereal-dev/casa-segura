/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@casa-segura/shared'],
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
