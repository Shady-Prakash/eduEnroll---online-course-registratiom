/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "image.mux.com" },
      // Clerk profile photos (instructor & reviewer avatars)
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
  experimental: {
    // Tree-shake barrel-file packages so only the icons/components used are bundled.
    optimizePackageImports: ["lucide-react", "react-icons", "recharts", "date-fns"],
  },
}

module.exports = nextConfig
