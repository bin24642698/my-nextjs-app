// 中文说明：登录接口（后端），遵循项目要求，所有后端功能放在 app/api 下。
// 输入：POST JSON { email, password }
// 输出：Supabase 返回的会话/错误信息。

import { NextRequest, NextResponse } from "next/server";
import { mapSupabaseAuthError } from "../_utils";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "缺少 email 或 password" },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return NextResponse.json(
        { error: "未配置 Supabase 环境变量" },
        { status: 500 }
      );
    }

    // 中文说明：调用 Supabase GoTrue 密码登录端点，服务端代理转发，隐藏真实 URL/Key。
    const resp = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      const zh = mapSupabaseAuthError(data, resp.status) || "登录失败";
      return NextResponse.json({ error: zh }, { status: resp.status });
    }

    // 中文说明：原样返回 access_token/refresh_token/user 等，前端接收后设置会话。
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "服务器错误" }, { status: 500 });
  }
}
