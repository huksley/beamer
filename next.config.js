/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // Nowhere to cache the images in Lambda (read only)
    unoptimized: true, // Next 12.3+, other "experimental -> images -> unoptimized"
  },
  output: "standalone", // THIS IS IMPORTANT
  // Feedback thread https://github.com/vercel/next.js/discussions/41745
  // experimental: { appDir: true },
};

module.exports = nextConfig;
