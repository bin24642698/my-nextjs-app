"use client";

// 中文说明：
// 客户端 Providers 汇总，集中管理全局状态注入，避免在服务器组件中直接使用 client 逻辑。

import { AuthProvider } from "@/contexts/AuthContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

