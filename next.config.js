/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    unoptimized: false,
  },
  typescript: {
    // Build succeeds locally; don't let stale caches break Vercel builds
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
