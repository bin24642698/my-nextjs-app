'use client';

import GlobalNav from '@/components/GlobalNav';

export default function WorkflowPage() {
  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--primary-bg)'}}>
      {/* 全局导航栏 */}
      <GlobalNav title="画布工作流" showBackButton={true} />

      {/* 主内容区域 */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 空状态占位 */}
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-primary mb-3">画布工作流功能</h2>
            <p className="text-secondary text-lg mb-8">
              此功能正在开发中，敬请期待...
            </p>

            <div className="inline-block px-6 py-3 bg-gray-100 rounded-lg">
              <p className="text-muted text-sm">
                画布工作流将帮助你可视化管理文档编辑任务
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
