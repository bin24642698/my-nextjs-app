'use client';

import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useIDBDocument } from '@/hooks/useIDBDocument';
import type { Chapter } from '@/utils/idb/schema';
import { parseChapters, contentToHtml } from '@/utils/chapterParser';

// 动态导入编辑器组件,跳过 SSR
const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-secondary">编辑器加载中...</p>
      </div>
    </div>
  ),
});

// 动态导入 AI 对话侧边栏组件
const AIChatSidebar = dynamic(() => import('@/components/AIChatSidebar'), {
  ssr: false,
});

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.id as string;
  const { document: fileData, loading, error, saveDocument } = useIDBDocument(fileId);

  // 初始化章节数据
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterId, setCurrentChapterId] = useState<string>('1');

  // AI 对话侧边栏状态
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    if (fileData) {
      // 如果文档已有章节数据，使用文档的章节
      if (fileData.chapters && fileData.chapters.length > 0) {
        setChapters(fileData.chapters);
        setCurrentChapterId(fileData.currentChapterId || fileData.chapters[0].id);
      } else {
        // 否则自动解析章节
        const parsedChapters = parseChapters(fileData.content || '');

        // 将每个章节的内容转换为HTML格式（保持换行）
        const chaptersWithHtml = parsedChapters.map(chapter => ({
          ...chapter,
          content: contentToHtml(chapter.content)
        }));

        setChapters(chaptersWithHtml);
        setCurrentChapterId(chaptersWithHtml[0].id);

        // 保存解析后的章节到数据库
        saveDocument({
          chapters: chaptersWithHtml,
          currentChapterId: chaptersWithHtml[0].id
        });
      }
    }
  }, [fileData?.id]); // 只在fileData.id变化时执行

  const handleContentChange = (_newContent: string) => {
    if (!fileData) return;
    // 内容变化会通过onChaptersUpdate处理，这里保持向后兼容
  };

  const handleChaptersUpdate = (updatedChapters: Chapter[]) => {
    setChapters(updatedChapters);
    // 保存章节数据到IndexedDB
    saveDocument({ chapters: updatedChapters });
  };

  const handleChapterChange = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    // 保存当前章节ID到IndexedDB
    saveDocument({ currentChapterId: chapterId });
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{backgroundColor: 'var(--primary-bg)'}}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary text-lg">加载文档中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center" style={{backgroundColor: 'var(--primary-bg)'}}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">加载失败</h1>
          <p className="text-secondary mb-6">{error.message}</p>
          <button onClick={handleBack} className="btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="h-screen flex items-center justify-center" style={{backgroundColor: 'var(--primary-bg)'}}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">文件未找到</h1>
          <p className="text-secondary mb-6">无法找到该文档，可能已被删除</p>
          <button onClick={handleBack} className="btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{backgroundColor: 'var(--primary-bg)'}}>
      {/* 顶部导航栏 */}
      <nav className="bg-white border-b border-light shadow-sm z-20">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <button
                onClick={handleBack}
                className="flex-shrink-0 p-2 rounded-lg text-secondary hover:text-primary hover:bg-light transition-all"
                title="返回首页"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="h-8 w-px bg-border-light hidden sm:block"></div>

              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-base sm:text-lg font-semibold text-primary truncate" title={fileData.name}>
                  {fileData.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {/* AI 功能按钮 - 桌面端 */}
              <button
                onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                className={`hidden sm:flex btn-primary px-4 py-2 text-sm ${
                  isAIChatOpen ? 'opacity-80' : ''
                }`}
                title={isAIChatOpen ? '关闭 AI 功能' : '打开 AI 功能'}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                AI功能
              </button>

              {/* AI 功能按钮 - 移动端 */}
              <button
                onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                className={`sm:hidden p-2 rounded-lg transition-all ${
                  isAIChatOpen
                    ? 'bg-blue-600 text-white'
                    : 'text-secondary hover:text-primary hover:bg-light'
                }`}
                title={isAIChatOpen ? '关闭 AI 功能' : '打开 AI 功能'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </button>

              <button
                onClick={() => alert('文件已自动保存到 IndexedDB')}
                className="hidden sm:flex btn-primary px-4 py-2 text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已保存
              </button>

              {/* 移动端保存图标 */}
              <button
                onClick={() => alert('文件已自动保存到 IndexedDB')}
                className="sm:hidden p-2 rounded-lg text-green-600 bg-green-50"
                title="已自动保存"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 编辑器和侧边栏容器 */}
      <main className="flex-1 overflow-hidden min-h-0 flex">
        {/* 编辑器区域 */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <TiptapEditor
            initialContent={fileData.content}
            onChange={handleContentChange}
            fileName={fileData.name}
            chapters={chapters}
            currentChapterId={currentChapterId}
            onChapterChange={handleChapterChange}
            onChaptersUpdate={handleChaptersUpdate}
          />
        </div>

        {/* AI 对话侧边栏 */}
        {isAIChatOpen && (
          <AIChatSidebar
            isOpen={isAIChatOpen}
            onClose={() => setIsAIChatOpen(false)}
            documentContent={fileData.content}
          />
        )}
      </main>
    </div>
  );
}
