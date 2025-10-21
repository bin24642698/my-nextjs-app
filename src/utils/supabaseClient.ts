"use client";

// 中文说明：
// 这是浏览器端 Supabase 客户端的单例封装，
// 供登录/注册后在前端设置会话或执行客户端查询复用。

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser() {
  // 中文说明：避免重复创建客户端，使用单例。
  if (browserClient) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !anonKey) {
    throw new Error("未配置 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  browserClient = createClient(url, anonKey, {
    auth: {
      // 中文说明：持久化到本地存储，使刷新后仍能保持登录状态。
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return browserClient;
}

