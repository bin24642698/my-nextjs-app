'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

interface GlobalNavProps {
  title?: string;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
}

export default function GlobalNav({ title = '文档编辑平台', showBackButton = false, rightContent }: GlobalNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  // 移动端菜单开关
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
    <nav className="bg-white border-b border-light shadow-sm z-20">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* 返回按钮 */}
            {showBackButton && (
              <>
                <button
                  onClick={() => router.back()}
                  className="flex-shrink-0 p-2 rounded-lg text-secondary hover:text-primary hover:bg-light transition-all"
                  title="返回"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="h-8 w-px bg-border-light hidden sm:block"></div>
              </>
            )}

            {/* 标题 */}
            <h1 className="text-base sm:text-lg font-semibold text-primary truncate">
              {title}
            </h1>

            <div className="h-8 w-px bg-border-light hidden sm:block mx-2"></div>

            {/* 通用功能按钮区（左侧） */}
            <div className="hidden sm:flex items-center space-x-3">
              {/* 首页按钮 */}
              <button
                onClick={() => router.push('/')}
                className={`px-4 py-2 rounded-lg text-base font-bold transition-all flex items-center space-x-2 ${
                  pathname === '/'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-primary hover:text-blue-600 hover:bg-light'
                }`}
                title="首页"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>首页</span>
              </button>

              {/* 提示词库按钮 */}
              <button
                onClick={() => router.push('/prompts')}
                className={`px-4 py-2 rounded-lg text-base font-bold transition-all flex items-center space-x-2 ${
                  pathname === '/prompts'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-primary hover:text-blue-600 hover:bg-light'
                }`}
                title="提示词库"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>提示词库</span>
              </button>

              {/* 画布工作流按钮 */}
              <button
                onClick={() => router.push('/workflow')}
                className={`px-4 py-2 rounded-lg text-base font-bold transition-all flex items-center space-x-2 ${
                  pathname === '/workflow'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-primary hover:text-blue-600 hover:bg-light'
                }`}
                title="画布工作流"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
                <span>画布工作流</span>
              </button>
            </div>

            {/* 移动端下拉菜单按钮 */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`sm:hidden p-2 rounded-lg transition-all ${mobileOpen ? 'text-blue-600 bg-blue-50' : 'text-secondary hover:text-primary hover:bg-light'}`}
              title="菜单"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* 右侧自定义内容 */}
          {rightContent && (
            <div className="flex items-center space-x-2 ml-4">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </nav>

    {/* 移动端下拉菜单内容 */}
    {mobileOpen && (
      <div className="sm:hidden bg-white border-b border-light shadow-sm z-10">
        <div className="px-4 py-2 space-y-2">
          {/* 首页 - 移动端 */}
          <button
            onClick={() => { setMobileOpen(false); router.push('/'); }}
            className={`w-full flex items-center justify-start px-3 py-2 rounded-lg text-base font-bold transition-all ${
              pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-primary hover:text-blue-600 hover:bg-light'
            }`}
            title="首页"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            首页
          </button>

          {/* 提示词库 - 移动端 */}
          <button
            onClick={() => { setMobileOpen(false); router.push('/prompts'); }}
            className={`w-full flex items-center justify-start px-3 py-2 rounded-lg text-base font-bold transition-all ${
              pathname === '/prompts' ? 'text-blue-600 bg-blue-50' : 'text-primary hover:text-blue-600 hover:bg-light'
            }`}
            title="提示词库"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            提示词库
          </button>

          {/* 画布工作流 - 移动端 */}
          <button
            onClick={() => { setMobileOpen(false); router.push('/workflow'); }}
            className={`w-full flex items-center justify-start px-3 py-2 rounded-lg text-base font-bold transition-all ${
              pathname === '/workflow' ? 'text-blue-600 bg-blue-50' : 'text-primary hover:text-blue-600 hover:bg-light'
            }`}
            title="画布工作流"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
            画布工作流
          </button>
        </div>
      </div>
    )}
    </>
  );
}
