import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 必须加上这个空对象，明确告诉 Next.js 16 咱们兼顾了 Turbopack
  turbopack: {},

  // 必须保留的 WebAssembly 兼容配置
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    return config;
  },
};

export default nextConfig;