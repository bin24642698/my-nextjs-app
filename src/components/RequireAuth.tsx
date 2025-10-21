"use client";

// 中文说明：
// 全局路由保护组件：默认所有页面需要登录，未登录时重定向到 /auth/login。
// 允许的公开路径：/auth/*、/api/*、/_next/*、/favicon.*、/public/* 等静态与认证页面。

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function isPublicPath(path: string) {
  if (!path) return true;
  return (
    path.startsWith("/auth") ||
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.startsWith("/public") ||
    path === "/robots.txt" ||
    path === "/sitemap.xml"
  );
}

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [waited, setWaited] = useState(false);

  const isPublic = useMemo(() => isPublicPath(pathname), [pathname]);

  // 超时兜底：若 2s 后仍在 loading，视为未登录，触发跳转逻辑
  useEffect(() => {
    if (!isPublic && loading && !waited) {
      const t = setTimeout(() => setWaited(true), 2000);
      return () => clearTimeout(t);
    }
  }, [loading, isPublic, waited]);

  // 未登录且访问受保护页面时，跳转到登录页
  useEffect(() => {
    if ((loading && !waited) || isPublic) return;
    if (!user && !redirecting) {
      const next = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      setRedirecting(true);
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
    }
  }, [loading, waited, user, isPublic, pathname, searchParams, router, redirecting]);

  // 在登录页/注册页，如已登录且带 next 参数，则跳回 next（可选择保留，当前仅保护全局即可）
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (pathname.startsWith("/auth")) {
      const next = searchParams?.get("next");
      if (next) router.replace(next);
    }
  }, [loading, user, pathname, searchParams, router]);

  // 加载中或正在重定向时的占位
  if (((loading && !isPublic) && !waited) || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-secondary">正在验证登录状态…</div>
      </div>
    );
  }

  // 公共路径或已登录，正常渲染
  if (isPublic || user) return <>{children}</>;

  // 未登录时会在 effect 中触发跳转，这里返回空以避免闪烁
  return null;
}
