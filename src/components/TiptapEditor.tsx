'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect, useCallback, useState } from 'react';

interface TiptapEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  fileName?: string;
}

export default function TiptapEditor({ initialContent = '', onChange, fileName = '未命名文档' }: TiptapEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline hover:text-blue-700',
        },
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      onChange?.(text);

      // 更新字数统计
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharCount(text.length);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
        style: `
          color: var(--primary-text);
          font-family: inherit;
          padding: 1.5rem;
          height: auto;
        `,
      },
    },
  });

  // 当初始内容改变时更新编辑器
  useEffect(() => {
    if (editor && initialContent !== editor.getText()) {
      const htmlContent = initialContent.replace(/\n/g, '<br>');
      editor.commands.setContent(htmlContent);

      // 初始化字数统计
      const words = initialContent.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharCount(initialContent.length);
    }
  }, [editor, initialContent]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('输入链接地址', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!editor) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">编辑器加载中...</p>
        </div>
      </div>
    );
  }

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all hover:scale-110 ${
        active
          ? 'bg-dark text-white shadow-md'
          : 'text-secondary hover:bg-light hover:text-primary'
      } ${disabled ? 'opacity-30 cursor-not-allowed hover:scale-100' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* 顶部工具栏 */}
      <div className="border-b border-light bg-white flex-shrink-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          {/* 左侧工具栏 */}
          <div className="flex items-center gap-1 overflow-x-auto flex-1">
            {/* 文本格式 */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="粗体 (Ctrl+B)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="斜体 (Ctrl+I)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h10M4 20h10m-3-16l-4 16" />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              title="删除线"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M9 5l-1 14M16 5l1 14" />
              </svg>
            </ToolbarButton>

            <div className="w-px h-6 bg-border-light mx-1"></div>

            {/* 标题 */}
            {[1, 2, 3].map((level) => (
              <ToolbarButton
                key={level}
                onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
                active={editor.isActive('heading', { level })}
                title={`标题 ${level}`}
              >
                <span className="font-bold text-sm">H{level}</span>
              </ToolbarButton>
            ))}

            <div className="w-px h-6 bg-border-light mx-1"></div>

            {/* 列表 */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="无序列表"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="有序列表"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h12M9 12h12M9 19h12M3.5 5.5l1-1m-1 7l1-1m-1 7l1-1" />
              </svg>
            </ToolbarButton>

            <div className="w-px h-6 bg-border-light mx-1"></div>

            {/* 引用和代码 */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="引用"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h8m-8 4h8M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive('codeBlock')}
              title="代码块"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={addLink}
              active={editor.isActive('link')}
              title="插入链接"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </ToolbarButton>

            <div className="w-px h-6 bg-border-light mx-1 hidden sm:block"></div>

            {/* 撤销/重做 */}
            <div className="hidden sm:flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="撤销 (Ctrl+Z)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="重做 (Ctrl+Y)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
              </ToolbarButton>
            </div>
          </div>

          {/* 右侧操作 */}
          <div className="flex items-center gap-2 ml-4">
            <ToolbarButton
              onClick={toggleFullscreen}
              title={isFullscreen ? '退出全屏' : '全屏模式'}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </ToolbarButton>
          </div>
        </div>

        {/* 文件信息栏（移动端显示） */}
        <div className="sm:hidden px-4 py-2 border-t border-light bg-light/50 flex items-center justify-between text-xs text-secondary">
          <span className="truncate flex-1">{fileName}</span>
          <span className="ml-2 whitespace-nowrap">{wordCount} 词 · {charCount} 字符</span>
        </div>
      </div>

      {/* 主编辑区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 编辑器内容区 */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* 侧边栏信息面板（桌面端） */}
        <div className="hidden lg:block w-64 border-l border-light bg-light/30 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* 文档信息 */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-primary mb-3 text-sm">文档信息</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-secondary">文件名:</span>
                  <span className="text-primary font-medium truncate ml-2" title={fileName}>
                    {fileName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">字数:</span>
                  <span className="text-primary font-medium">{wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">字符数:</span>
                  <span className="text-primary font-medium">{charCount}</span>
                </div>
              </div>
            </div>

            {/* 快捷键提示 */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-primary mb-3 text-sm">快捷键</h3>
              <div className="space-y-2 text-xs text-secondary">
                <div className="flex justify-between">
                  <span>粗体</span>
                  <kbd className="px-2 py-1 bg-light rounded text-xs">Ctrl+B</kbd>
                </div>
                <div className="flex justify-between">
                  <span>斜体</span>
                  <kbd className="px-2 py-1 bg-light rounded text-xs">Ctrl+I</kbd>
                </div>
                <div className="flex justify-between">
                  <span>撤销</span>
                  <kbd className="px-2 py-1 bg-light rounded text-xs">Ctrl+Z</kbd>
                </div>
                <div className="flex justify-between">
                  <span>重做</span>
                  <kbd className="px-2 py-1 bg-light rounded text-xs">Ctrl+Y</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部状态栏（桌面端） */}
      <div className="hidden sm:block border-t border-light bg-light/30 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-secondary max-w-4xl mx-auto">
          <span className="truncate flex-1">{fileName}</span>
          <div className="flex items-center gap-4 ml-4">
            <span>{wordCount} 词</span>
            <span>{charCount} 字符</span>
            <span className="text-green-600">● 已自动保存</span>
          </div>
        </div>
      </div>
    </div>
  );
}
