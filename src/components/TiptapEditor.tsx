'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect, useCallback, useState } from 'react';
import type { Chapter, SettingItem, CharacterItem, KnowledgeItem } from '@/utils/idb/schema';
import { SettingItemService, CharacterItemService, KnowledgeItemService } from '@/utils/idb/workItems';

interface TiptapEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  fileName?: string;
  chapters?: Chapter[];
  currentChapterId?: string;
  onChapterChange?: (chapterId: string) => void;
  onChaptersUpdate?: (chapters: Chapter[]) => void;
  documentId?: string; // 文档ID，用于关联条目
}

export default function TiptapEditor({
  initialContent = '',
  onChange,
  fileName = '未命名文档',
  chapters: propChapters,
  currentChapterId: propCurrentChapterId,
  onChapterChange,
  onChaptersUpdate,
  documentId
}: TiptapEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 中文说明：左侧栏上部分的三个可下拉选项状态
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [charactersExpanded, setCharactersExpanded] = useState(false);
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(false);

  // 中文说明：条目列表状态
  const [settingItems, setSettingItems] = useState<SettingItem[]>([]);
  const [characterItems, setCharacterItems] = useState<CharacterItem[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);

  // 中文说明：当前编辑的条目类型和ID
  const [editingType, setEditingType] = useState<'chapter' | 'setting' | 'character' | 'knowledge'>('chapter');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // 中文说明：添加条目弹窗状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'setting' | 'character' | 'knowledge'>('setting');
  const [newItemTitle, setNewItemTitle] = useState('');

  // 内部章节状态管理（如果没有从props传入）
  const [internalChapters, setInternalChapters] = useState<Chapter[]>([
    { id: '1', title: '第一章', content: '' },
    { id: '2', title: '第二章', content: '' },
    { id: '3', title: '第三章', content: '' },
  ]);
  const [internalCurrentChapterId, setInternalCurrentChapterId] = useState('1');

  // 使用props或内部状态
  const chapters = propChapters || internalChapters;
  const currentChapterId = propCurrentChapterId || internalCurrentChapterId;
  const currentChapter = chapters.find(ch => ch.id === currentChapterId);

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
    content: currentChapter?.content || initialContent,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const html = editor.getHTML();

      // 根据当前编辑类型保存内容
      if (editingType === 'chapter' && currentChapter) {
        // 更新章节内容
        const updatedChapters = chapters.map(ch =>
          ch.id === currentChapterId ? { ...ch, content: html } : ch
        );

        if (onChaptersUpdate) {
          onChaptersUpdate(updatedChapters);
        } else {
          setInternalChapters(updatedChapters);
        }
      } else if (editingType === 'setting' && editingItemId) {
        // 更新设定条目内容
        SettingItemService.update(editingItemId, { content: html }).catch(console.error);
        setSettingItems(prev => prev.map(item =>
          item.id === editingItemId ? { ...item, content: html } : item
        ));
      } else if (editingType === 'character' && editingItemId) {
        // 更新角色条目内容
        CharacterItemService.update(editingItemId, { content: html }).catch(console.error);
        setCharacterItems(prev => prev.map(item =>
          item.id === editingItemId ? { ...item, content: html } : item
        ));
      } else if (editingType === 'knowledge' && editingItemId) {
        // 更新知识库条目内容
        KnowledgeItemService.update(editingItemId, { content: html }).catch(console.error);
        setKnowledgeItems(prev => prev.map(item =>
          item.id === editingItemId ? { ...item, content: html } : item
        ));
      }

      onChange?.(text);

      // 更新字数统计
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharCount(text.length);
    },
    editorProps: {
      // 禁用 ProseMirror 默认的滚动到选区逻辑，避免把整页滚动到最底部
      handleScrollToSelection: () => true,
      attributes: {
        class: 'focus:outline-none prose prose-sm max-w-none',
        style: `
          color: var(--primary-text);
          font-family: inherit;
          padding: 1.5rem;
        `,
      },
    },
  });

  // 当章节切换时更新编辑器内容
  useEffect(() => {
    if (editor && currentChapter) {
      const content = currentChapter.content || '';
      if (content !== editor.getHTML()) {
        editor.commands.setContent(content);

        // 更新字数统计
        const text = editor.getText();
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
        setCharCount(text.length);
      }
    }
  }, [editor, currentChapterId, currentChapter]);

  // 章节切换时重置编辑区域滚动条到顶部
  useEffect(() => {
    // 当 currentChapterId 变化时，将 ProseMirror 容器的滚动条重置为顶部
    // 使用 editor.view.dom 可直接拿到 ProseMirror 根节点，避免 DOM 查询
    if (!editor) return;
    const el = editor.view?.dom as HTMLElement | undefined;
    if (!el) return;

    // 使用 requestAnimationFrame 确保在 setContent 渲染完成后再滚动，避免竞争条件
    requestAnimationFrame(() => {
      try {
        el.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      } catch {
        // 兜底：老环境不支持 scrollTo 参数对象时退化
        el.scrollTop = 0;
        el.scrollLeft = 0;
      }
    });
  }, [editor, currentChapterId]);

  // 加载条目数据
  useEffect(() => {
    if (!documentId) return;

    const loadItems = async () => {
      try {
        const [settings, characters, knowledge] = await Promise.all([
          SettingItemService.getByDocumentId(documentId),
          CharacterItemService.getByDocumentId(documentId),
          KnowledgeItemService.getByDocumentId(documentId),
        ]);
        setSettingItems(settings);
        setCharacterItems(characters);
        setKnowledgeItems(knowledge);
      } catch (error) {
        console.error('加载条目失败:', error);
      }
    };

    loadItems();
  }, [documentId]);

  // 处理章节切换
  const handleChapterClick = useCallback((chapterId: string) => {
    setEditingType('chapter');
    setEditingItemId(null);
    if (onChapterChange) {
      onChapterChange(chapterId);
    } else {
      setInternalCurrentChapterId(chapterId);
    }
  }, [onChapterChange]);

  // 处理条目点击编辑
  const handleItemClick = useCallback((type: 'setting' | 'character' | 'knowledge', itemId: string) => {
    setEditingType(type);
    setEditingItemId(itemId);

    // 根据类型获取对应的条目内容
    let content = '';
    if (type === 'setting') {
      const item = settingItems.find(i => i.id === itemId);
      content = item?.content || '';
    } else if (type === 'character') {
      const item = characterItems.find(i => i.id === itemId);
      content = item?.content || '';
    } else if (type === 'knowledge') {
      const item = knowledgeItems.find(i => i.id === itemId);
      content = item?.content || '';
    }

    // 更新编辑器内容
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, settingItems, characterItems, knowledgeItems]);

  // 添加新条目
  const handleAddItem = useCallback(async () => {
    if (!documentId || !newItemTitle.trim()) return;

    try {
      if (addModalType === 'setting') {
        const newItem = await SettingItemService.create({
          title: newItemTitle,
          content: '',
          documentId,
        });
        setSettingItems(prev => [...prev, newItem]);
      } else if (addModalType === 'character') {
        const newItem = await CharacterItemService.create({
          name: newItemTitle,
          content: '',
          documentId,
        });
        setCharacterItems(prev => [...prev, newItem]);
      } else if (addModalType === 'knowledge') {
        const newItem = await KnowledgeItemService.create({
          title: newItemTitle,
          content: '',
          documentId,
        });
        setKnowledgeItems(prev => [...prev, newItem]);
      }

      setShowAddModal(false);
      setNewItemTitle('');
    } catch (error) {
      console.error('添加条目失败:', error);
      alert('添加失败，请重试');
    }
  }, [documentId, newItemTitle, addModalType]);

  // 删除条目
  const handleDeleteItem = useCallback(async (type: 'setting' | 'character' | 'knowledge', itemId: string) => {
    if (!confirm('确定要删除该条目吗？')) return;

    try {
      if (type === 'setting') {
        await SettingItemService.delete(itemId);
        setSettingItems(prev => prev.filter(i => i.id !== itemId));
      } else if (type === 'character') {
        await CharacterItemService.delete(itemId);
        setCharacterItems(prev => prev.filter(i => i.id !== itemId));
      } else if (type === 'knowledge') {
        await KnowledgeItemService.delete(itemId);
        setKnowledgeItems(prev => prev.filter(i => i.id !== itemId));
      }

      // 如果删除的是当前编辑的条目，切换回章节编辑
      if (editingItemId === itemId) {
        setEditingType('chapter');
        setEditingItemId(null);
      }
    } catch (error) {
      console.error('删除条目失败:', error);
      alert('删除失败，请重试');
    }
  }, [editingItemId]);

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
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 左侧侧边栏 */}
        <div className="hidden lg:flex lg:flex-col w-64 border-r border-light bg-light/30 flex-shrink-0">
          {/* 上栏：设定、角色、知识库 */}
          <div className="border-b border-light overflow-y-auto flex-shrink-0" style={{ maxHeight: '40%' }}>
            <div className="p-4 space-y-2">
              {/* 设定 */}
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setSettingsExpanded(!settingsExpanded)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-light transition-all"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium text-primary">设定</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-secondary transition-transform ${settingsExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {settingsExpanded && (
                  <div className="px-2 py-2 border-t border-light bg-light/50 space-y-1">
                    {settingItems.length === 0 ? (
                      <p className="text-xs text-secondary px-2 py-1">暂无设定内容</p>
                    ) : (
                      settingItems.map(item => (
                        <div key={item.id} className="flex items-center gap-1">
                          <button
                            onClick={() => handleItemClick('setting', item.id)}
                            className={`flex-1 text-left px-2 py-1.5 rounded text-xs transition-all ${
                              editingType === 'setting' && editingItemId === item.id
                                ? 'bg-dark text-black font-medium'
                                : 'text-secondary hover:bg-white hover:text-primary'
                            }`}
                          >
                            {item.title}
                          </button>
                          <button
                            onClick={() => handleDeleteItem('setting', item.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-50 transition-all"
                            title="删除"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                    <button
                      onClick={() => { setAddModalType('setting'); setShowAddModal(true); }}
                      className="w-full px-2 py-1.5 rounded border border-dashed border-border-light text-xs text-secondary hover:border-dark hover:text-primary transition-all"
                    >
                      + 添加设定
                    </button>
                  </div>
                )}
              </div>

              {/* 角色 */}
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setCharactersExpanded(!charactersExpanded)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-light transition-all"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-medium text-primary">角色</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-secondary transition-transform ${charactersExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {charactersExpanded && (
                  <div className="px-2 py-2 border-t border-light bg-light/50 space-y-1">
                    {characterItems.length === 0 ? (
                      <p className="text-xs text-secondary px-2 py-1">暂无角色内容</p>
                    ) : (
                      characterItems.map(item => (
                        <div key={item.id} className="flex items-center gap-1">
                          <button
                            onClick={() => handleItemClick('character', item.id)}
                            className={`flex-1 text-left px-2 py-1.5 rounded text-xs transition-all ${
                              editingType === 'character' && editingItemId === item.id
                                ? 'bg-dark text-black font-medium'
                                : 'text-secondary hover:bg-white hover:text-primary'
                            }`}
                          >
                            {item.name}
                          </button>
                          <button
                            onClick={() => handleDeleteItem('character', item.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-50 transition-all"
                            title="删除"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                    <button
                      onClick={() => { setAddModalType('character'); setShowAddModal(true); }}
                      className="w-full px-2 py-1.5 rounded border border-dashed border-border-light text-xs text-secondary hover:border-dark hover:text-primary transition-all"
                    >
                      + 添加角色
                    </button>
                  </div>
                )}
              </div>

              {/* 知识库 */}
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setKnowledgeExpanded(!knowledgeExpanded)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-light transition-all"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm font-medium text-primary">知识库</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-secondary transition-transform ${knowledgeExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {knowledgeExpanded && (
                  <div className="px-2 py-2 border-t border-light bg-light/50 space-y-1">
                    {knowledgeItems.length === 0 ? (
                      <p className="text-xs text-secondary px-2 py-1">暂无知识库内容</p>
                    ) : (
                      knowledgeItems.map(item => (
                        <div key={item.id} className="flex items-center gap-1">
                          <button
                            onClick={() => handleItemClick('knowledge', item.id)}
                            className={`flex-1 text-left px-2 py-1.5 rounded text-xs transition-all ${
                              editingType === 'knowledge' && editingItemId === item.id
                                ? 'bg-dark text-black font-medium'
                                : 'text-secondary hover:bg-white hover:text-primary'
                            }`}
                          >
                            {item.title}
                          </button>
                          <button
                            onClick={() => handleDeleteItem('knowledge', item.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-50 transition-all"
                            title="删除"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                    <button
                      onClick={() => { setAddModalType('knowledge'); setShowAddModal(true); }}
                      className="w-full px-2 py-1.5 rounded border border-dashed border-border-light text-xs text-secondary hover:border-dark hover:text-primary transition-all"
                    >
                      + 添加知识库
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 下栏：章节目录 */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4">
              <h3 className="font-semibold text-primary mb-3 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                章节目录
              </h3>
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterClick(chapter.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      currentChapterId === chapter.id
                        ? 'bg-dark text-black shadow-md'
                        : 'bg-white text-secondary hover:bg-light hover:text-primary hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${
                        currentChapterId === chapter.id ? 'text-black' : 'text-primary'
                      }`}>
                        {chapter.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* 添加章节按钮（预留功能） */}
              <button
                className="w-full mt-4 px-4 py-2 rounded-lg border-2 border-dashed border-border-light text-secondary hover:border-dark hover:text-primary transition-all text-sm"
                title="添加新章节"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加章节
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 编辑器内容区 */}
        <div className="tiptap-editor flex-1 overflow-hidden bg-white">
          <div className="max-w-4xl mx-auto h-full">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* 底部状态栏（桌面端） */}
      <div className="hidden sm:block border-t border-light bg-light/30 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-secondary max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="truncate flex-1">{fileName}</span>
            <span className="text-primary font-medium">· {currentChapter?.title || '未选择章节'}</span>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <span>{wordCount} 词</span>
            <span>{charCount} 字符</span>
            <span className="text-green-600">● 已自动保存</span>
          </div>
        </div>
      </div>

      {/* 添加条目弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-light">
              <h2 className="text-lg font-bold text-primary">
                添加{addModalType === 'setting' ? '设定' : addModalType === 'character' ? '角色' : '知识库'}
              </h2>
            </div>
            <div className="px-6 py-4">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder={`输入${addModalType === 'setting' ? '设定' : addModalType === 'character' ? '角色' : '知识库'}名称`}
                className="form-input w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem();
                  if (e.key === 'Escape') { setShowAddModal(false); setNewItemTitle(''); }
                }}
                autoFocus
              />
            </div>
            <div className="px-6 py-3 border-t border-light flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowAddModal(false); setNewItemTitle(''); }}
                className="px-4 py-2 rounded-lg text-secondary hover:text-primary hover:bg-light transition-all"
              >
                取消
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItemTitle.trim()}
                className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
