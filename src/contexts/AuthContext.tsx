"use client";

// 中文说明：
// 全局认证上下文：集中管理用户登录状态，提供登出方法，
// 并在应用顶层监听 Supabase 的会话变化。

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/utils/supabaseClient";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // 初始化：无论成功/失败，都将 loading 置为 false，避免路由保护卡住
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data.user ?? null);
      } catch (err) {
        if (!mounted) return;
        console.warn("获取登录状态失败：", err);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // 监听会话变化
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      // 中文说明：会话变化时，及时同步用户状态，避免界面卡在加载中。
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      // 中文说明：正确取消订阅，避免内存泄漏或重复回调。
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    // 中文说明：直接跳转到登录页，避免先进入受保护首页再二次重定向导致的“一直转圈”。
    await supabase.auth.signOut();
    setUser(null);
    router.replace("/auth/login");
  };

  const value = useMemo(() => ({ user, loading, signOut }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return ctx;
}

