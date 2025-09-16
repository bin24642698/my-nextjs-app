import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 明确指定项目根目录，解决多个lockfile警告
  outputFileTracingRoot: path.join(__dirname),
  
  // 其他配置选项
  experimental: {
    // 可根据需要添加其他实验性功能
  }
};

export default nextConfig;
