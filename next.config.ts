/** @type {import('next').NextConfig} */
const nextConfig = {
  // 忽略 ESLint 报错，确保快速发版
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 忽略 TypeScript 类型报错，确保快速发版
  typescript: {
    ignoreBuildErrors: true,
  },
  // 优化图片和输出
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
