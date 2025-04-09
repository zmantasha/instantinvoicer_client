// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // output: 'export',
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   images: { unoptimized: true },
//   experimental: { optimizeCss: true },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable Strict Mode
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['example.com'], // Add any other domains you want to allow
  },
  experimental: {
    // Disable the CSS optimization for now
    optimizeCss: false,
  },
};

module.exports = nextConfig;

