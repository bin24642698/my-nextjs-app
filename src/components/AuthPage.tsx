"use client";

// 中文说明：
// 统一的认证页外壳，登录/注册页面共用，确保样式一致。

import Link from "next/link";
import AuthForm from "@/components/AuthForm";

type Mode = "login" | "register";

export default function AuthPage({ mode }: { mode: Mode }) {
  const isLogin = mode === "login";
  const title = isLogin ? "欢迎回来" : "创建账户";
  const subtitle = isLogin
    ? "使用邮箱与密码登录您的账户"
    : "注册后即可开始使用平台能力";

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--primary-bg)' }}
    >
      <div className="card w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-primary mb-2">{title}</h1>
          <p className="text-secondary">{subtitle}</p>
        </div>
        <AuthForm mode={mode} />
        {isLogin ? (
          <p className="mt-4 text-sm text-secondary">
            还没有账号？<Link href="/auth/register" className="text-blue-600 underline">去注册</Link>
          </p>
        ) : (
          <p className="mt-4 text-sm text-secondary">
            已有账号？<Link href="/auth/login" className="text-blue-600 underline">去登录</Link>
          </p>
        )}
      </div>
    </main>
  );
}
