// 中文说明：
// 认证相关的通用工具：将 Supabase/GoTrue 返回的错误映射为中文可读提示。

export function mapSupabaseAuthError(err: any, status: number): string {
  const error = String(err?.error || err?.code || err?.error_code || "").toLowerCase();
  const desc: string = String(
    err?.error_description || err?.msg || err?.message || ""
  ).toLowerCase();

  // 优先根据标准 OAuth 错误码映射
  switch (error) {
    case "invalid_grant":
      return "邮箱或密码不正确";
    case "invalid_request":
      return "请求无效，请检查参数";
    case "unauthorized_client":
      return "未授权的客户端";
    case "invalid_client":
      return "客户端认证失败";
    case "access_denied":
      return "访问被拒绝";
    case "unsupported_grant_type":
      return "不支持的认证类型";
    case "invalid_scope":
      return "权限范围无效";
  }

  // 非标准 code 或仅有描述时的关键字匹配
  if (
    desc.includes("invalid login credentials") ||
    desc.includes("invalid email or password")
  ) {
    return "邮箱或密码不正确";
  }

  if (
    error.includes("email_exists") ||
    error.includes("user_already_exists") ||
    desc.includes("already registered") ||
    desc.includes("already exists")
  ) {
    return "邮箱已被注册";
  }

  if (
    error.includes("email_not_confirmed") ||
    desc.includes("email not confirmed") ||
    desc.includes("confirm your email")
  ) {
    return "邮箱未验证，请先前往邮箱完成验证";
  }

  if (desc.includes("password should be at least") || desc.includes("weak password")) {
    return "密码强度不足或长度不够";
  }

  if (desc.includes("over email rate limit") || error.includes("rate_limit") || status === 429) {
    return "请求过于频繁，请稍后再试";
  }

  if (status >= 500) {
    return "服务器错误，请稍后再试";
  }

  // 默认兜底
  return "操作失败，请稍后重试";
}

