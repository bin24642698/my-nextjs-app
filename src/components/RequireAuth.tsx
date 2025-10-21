"use client";

// 中文说明：
// 全局路由保护：默认所有页面需要登录；公开路径（/auth/*、/api/*、/_next/* 等）不受保护。
// 未登录访问受保护页面时，跳转到 /auth/login?next=当前路径。

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

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

  const isPublic = useMemo(() => isPublicPath(pathname), [pathname]);

  useEffect(() => {
    if (isPublic) return; // 公共路径不处理
    if (loading) return;  // 等待认证状态初始化
    if (!user && !redirecting) {
      const next = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      setRedirecting(true);
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
    }
  }, [isPublic, loading, user, pathname, searchParams, router]);

  // 受保护路径在加载中时给出短暂占位，避免闪烁
  if (!isPublic && loading) {
    return <LoadingScreen text="正在验证登录状态..." />;
  }

  // 未登录且已经触发跳转：保持全屏加载，避免闪烁
  if (!isPublic && !loading && !user) {
    return <LoadingScreen text="正在跳转到登录页..." />;
  }

  // 公共路径或已登录，正常渲染
  return <>{children}</>;
}
