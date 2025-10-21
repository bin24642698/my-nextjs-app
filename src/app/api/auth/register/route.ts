// 中文说明：注册接口（后端），遵循项目要求，所有后端功能放在 app/api 下。
// 输入：POST JSON { email, password }
// 输出：Supabase 返回的用户/会话/错误信息（视项目设置是否需要邮件确认）。

import { NextRequest, NextResponse } from "next/server";

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

    // 中文说明：调用 Supabase GoTrue 注册端点。
    const resp = await fetch(`${url}/auth/v1/signup`, {
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
      return NextResponse.json(
        { error: data?.error_description || data?.msg || "注册失败" },
        { status: resp.status }
      );
    }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "服务器错误" }, { status: 500 });
  }
}

