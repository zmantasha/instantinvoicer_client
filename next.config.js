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
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    // Disable the CSS optimization for now
    optimizeCss: false,
  },
};

module.exports = nextConfig;
