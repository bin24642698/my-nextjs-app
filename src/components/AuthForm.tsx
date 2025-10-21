"use client";

// 中文说明：
// 通用认证表单组件，通过 mode 区分登录与注册，
// 复用 UI 与交互逻辑，避免重复代码。

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/utils/supabaseClient";

type Mode = "login" | "register";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  // 中文说明：封装提交逻辑，根据 mode 调用不同的后端 API。
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    startTransition(async () => {
      try {
        const resp = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          setError(data?.error || `${mode === "login" ? "登录" : "注册"}失败`);
          return;
        }

        // 中文说明：如果返回了 token（登录必有，注册视设置可能返回），
        // 则在前端设置 Supabase 会话以保持登录状态。
        const access_token: string | undefined = data?.access_token;
        const refresh_token: string | undefined = data?.refresh_token;
        if (access_token && refresh_token) {
          const supabase = getSupabaseBrowser();
          await supabase.auth.setSession({ access_token, refresh_token });
        }

        if (mode === "login") {
          // 中文说明：登录成功后优先跳回 next 参数指定的路径，避免丢失上下文。
          const next = searchParams?.get("next");
          const isSafePath = next && next.startsWith("/") && !next.startsWith("//");
          router.replace(isSafePath ? (next as string) : "/");
        } else {
          // 中文说明：注册成功后的提示（若开启邮箱验证，此处不会立即登录）。
          setSuccess("注册成功，请检查邮箱完成验证（如已开启）。");
        }
      } catch (e: any) {
        setError(e?.message || "请求失败");
      }
    });
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-primary mb-6">
        {mode === "login" ? "登录" : "注册"}
      </h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <div className="mb-1 text-sm text-secondary">邮箱</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-3 py-2 border rounded-lg bg-white text-[var(--primary-text)] placeholder:text-[var(--secondary-text)] border-[var(--border-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-dark)] focus:border-[var(--color-dark)]"
          />
        </label>
        <label className="block">
          <div className="mb-1 text-sm text-secondary">密码</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="至少 6 位"
            className="w-full px-3 py-2 border rounded-lg bg-white text-[var(--primary-text)] placeholder:text-[var(--secondary-text)] border-[var(--border-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-dark)] focus:border-[var(--color-dark)]"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full justify-center mt-2"
        >
          {pending ? "处理中…" : mode === "login" ? "登录" : "注册"}
        </button>
      </form>

      {error && (
        <p className="text-[var(--error)] mt-3">错误：{error}</p>
      )}
      {success && (
        <p className="text-[var(--success)] mt-3">{success}</p>
      )}
    </div>
  );
}
