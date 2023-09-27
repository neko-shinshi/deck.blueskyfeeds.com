/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: false,
  swcMinify: true,
  poweredByHeader: false
}

module.exports = nextConfig
