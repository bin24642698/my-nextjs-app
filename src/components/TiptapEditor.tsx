'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect, useCallback } from 'react';

interface TiptapEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export default function TiptapEditor({ initialContent = '', onChange }: TiptapEditorProps) {
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
          class: 'text-blue-500 underline',
        },
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      onChange?.(text);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content',
        style: `
          color: var(--primary-text);
          font-family: inherit;
        `,
      },
    },
  });

  // 当初始内容改变时更新编辑器
  useEffect(() => {
    if (editor && initialContent !== editor.getText()) {
      // 处理纯文本内容，保持换行符
      const htmlContent = initialContent.replace(/\n/g, '<br>');
      editor.commands.setContent(htmlContent);
    }
  }, [editor, initialContent]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">编辑器加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* 工具栏 */}
      <div className="border-b border-light p-3 flex flex-wrap items-center gap-2 flex-shrink-0">
        {/* 文本格式化 */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
            editor.isActive('bold')
              ? 'bg-dark text-white border-dark'
              : 'bg-light text-primary border-border-light hover:bg-gray-100'
          }`}
        >
          粗体
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
            editor.isActive('italic')
              ? 'bg-dark text-white border-dark'
              : 'bg-light text-primary border-border-light hover:bg-gray-100'
          }`}
        >
          斜体
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
            editor.isActive('strike')
              ? 'bg-dark text-white border-dark'
              : 'bg-light text-primary border-border-light hover:bg-gray-100'
          }`}
        >
          删除线
        </button>

        <div className="w-px h-6 bg-border-light mx-2"></div>

        {/* 标题 */}
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
            className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
              editor.isActive('heading', { level })
                ? 'bg-dark text-white border-dark'
                : 'bg-light text-primary border-border-light hover:bg-gray-100'
            }`}
          >
            H{level}
          </button>
        ))}

        <div className="w-px h-6 bg-border-light mx-2"></div>

        {/* 列表 */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-dark text-white border-dark'
              : 'bg-light text-primary border-border-light hover:bg-gray-100'
          }`}
        >
          无序列表
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-dark text-white border-dark'
              : 'bg-light text-primary border-border-light hover:bg-gray-100'
          }`}
        >
          有序列表
        </button>

        <div className="w-px h-6 bg-border-light mx-2"></div>

        {/* 引用和代码 */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-dark text-white border-dark'
              : 'bg-light text-primary border-border-light hover:bg-gray-100'
          }`}
        >
          引用
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
            editor.isActive('code')
              ? 'bg-dark text-white border-dark'
              : 'bg-light text-primary border-border-light hover:bg-gray-100'
          }`}
        >
          代码
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
            editor.isActive('codeBlock')
              ? 'bg-dark text-white border-dark'
              : 'bg-light text-primary border-border-light hover:bg-gray-100'
          }`}
        >
          代码块
        </button>

        <div className="w-px h-6 bg-border-light mx-2"></div>

        {/* 链接 */}
        <button
          onClick={addLink}
          className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
            editor.isActive('link')
              ? 'bg-dark text-white border-dark'
              : 'bg-light text-primary border-border-light hover:bg-gray-100'
          }`}
        >
          链接
        </button>

        <div className="w-px h-6 bg-border-light mx-2"></div>

        {/* 撤销/重做 */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="px-3 py-1 rounded border text-sm font-medium bg-light text-primary border-border-light hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          撤销
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="px-3 py-1 rounded border text-sm font-medium bg-light text-primary border-border-light hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          重做
        </button>
      </div>

      {/* 编辑器 */}
      <div
        className="flex-1 border border-border-light rounded-lg tiptap-editor"
        style={{ backgroundColor: 'var(--primary-bg)', minHeight: 0 }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}