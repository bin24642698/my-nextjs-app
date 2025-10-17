'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SystemPromptService } from '@/utils/idb/systemPrompts';
import type { SystemPromptSchema } from '@/utils/idb/schema';

export default function PromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<SystemPromptSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SystemPromptSchema | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: '',
  });

  // 加载提示词列表
  const loadPrompts = async () => {
    setLoading(true);
    try {
      const allPrompts = await SystemPromptService.getAll();
      setPrompts(allPrompts);
    } catch (error) {
      console.error('加载提示词失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  // 打开新建/编辑弹窗
  const handleOpenModal = (prompt?: SystemPromptSchema) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData({
        title: prompt.title,
        content: prompt.content,
        description: prompt.description || '',
        category: prompt.category || '',
      });
    } else {
      setEditingPrompt(null);
      setFormData({
        title: '',
        content: '',
        description: '',
        category: '',
      });
    }
    setShowModal(true);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPrompt(null);
    setFormData({
      title: '',
      content: '',
      description: '',
      category: '',
    });
  };

  // 保存提示词
  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('标题和内容不能为空');
      return;
    }

    try {
      if (editingPrompt) {
        await SystemPromptService.update(editingPrompt.id, formData);
      } else {
        await SystemPromptService.create(formData);
      }
      await loadPrompts();
      handleCloseModal();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  // 删除提示词
  const handleDelete = async (id: string) => {
    try {
      await SystemPromptService.delete(id);
      await loadPrompts();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--primary-bg)' }}>
      {/* 顶部导航栏 */}
      <nav className="bg-white border-b border-light shadow-sm">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-light transition-all"
                title="返回"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-primary">提示词管理</h1>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary px-4 py-2 text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建提示词
            </button>
          </div>
        </div>
      </nav>

      {/* 内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary">加载中...</p>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-primary mb-2">暂无提示词</h2>
            <p className="text-secondary mb-6">点击右上角按钮创建您的第一个提示词卡片</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="card p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-primary flex-1 mr-2">{prompt.title}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(prompt)}
                      className="p-1.5 rounded-lg text-secondary hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="编辑"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(prompt.id)}
                      className="p-1.5 rounded-lg text-secondary hover:text-red-600 hover:bg-red-50 transition-all"
                      title="删除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {prompt.description && (
                  <p className="text-secondary text-sm mb-3">{prompt.description}</p>
                )}

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-secondary line-clamp-4 whitespace-pre-wrap">{prompt.content}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted">
                  {prompt.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{prompt.category}</span>
                  )}
                  <span>{new Date(prompt.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 新建/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-light px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary">
                {editingPrompt ? '编辑提示词' : '新建提示词'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-light transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-light rounded-lg focus:outline-none focus:border-dark transition-all"
                  placeholder="输入提示词标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">分类</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-light rounded-lg focus:outline-none focus:border-dark transition-all"
                  placeholder="例如：写作、创意、技术等"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">描述</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-light rounded-lg focus:outline-none focus:border-dark transition-all"
                  placeholder="简要描述这个提示词的用途"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-light rounded-lg focus:outline-none focus:border-dark transition-all min-h-[200px] resize-y"
                  placeholder="输入提示词内容..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-light px-6 py-4 flex items-center justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="btn-secondary px-6 py-2"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="btn-primary px-6 py-2"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-primary mb-4">确认删除</h3>
            <p className="text-secondary mb-6">
              确定要删除这个提示词吗？此操作无法撤销。
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary px-6 py-2"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
