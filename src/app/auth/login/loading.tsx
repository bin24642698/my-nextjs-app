// 中文说明：
// 登录页路由级加载组件。复用编辑器加载页的视觉风格（圆形旋转进度 + 文案）。

export default function Loading() {
  return (
    <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--primary-bg)' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-secondary">正在打开登录页...</p>
      </div>
    </div>
  );
}

