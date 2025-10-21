"use client";

// 中文说明：
// 统一的全屏加载画面组件，复用在登录页加载与路由保护跳转等场景，减少突兀闪烁。

export default function LoadingScreen({ text = "加载中..." }: { text?: string }) {
  return (
    <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--primary-bg)' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-secondary">{text}</p>
      </div>
    </div>
  );
}

