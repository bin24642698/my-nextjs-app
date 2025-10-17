'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useIDBDocuments } from '@/hooks/useIDBDocument';
import type { DocumentSchema } from '@/utils/idb/schema';
import GlobalNav from '@/components/GlobalNav';

export default function Home() {
  const router = useRouter();
  const { documents: uploadedFiles, addDocument, deleteDocument, clearAllDocuments } = useIDBDocuments();
  const [isDragOver, setIsDragOver] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'single' | 'all';
    id?: string;
    fileName?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 检测文本编码并转换为UTF-8
  const detectAndDecodeText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);

        // 先尝试UTF-8解码
        try {
          const utfDecoder = new TextDecoder('utf-8', { fatal: true });
          const utfText = utfDecoder.decode(uint8Array);
          resolve(utfText);
          return;
        } catch {
          // UTF-8解码失败，尝试GBK解码
          console.log('UTF-8解码失败，尝试GBK解码');
        }

        // 尝试GBK解码
        try {
          const gbkDecoder = new TextDecoder('gbk');
          const gbkText = gbkDecoder.decode(uint8Array);
          resolve(gbkText);
          return;
        } catch {
          // GBK解码失败，尝试GB2312
          console.log('GBK解码失败，尝试GB2312解码');
        }

        // 尝试GB2312解码
        try {
          const gb2312Decoder = new TextDecoder('gb2312');
          const gb2312Text = gb2312Decoder.decode(uint8Array);
          resolve(gb2312Text);
          return;
        } catch {
          // 所有编码都失败，使用默认UTF-8（可能包含乱码）
          console.log('所有编码解码失败，使用默认UTF-8');
          const fallbackDecoder = new TextDecoder('utf-8', { fatal: false });
          const fallbackText = fallbackDecoder.decode(uint8Array);
          resolve(fallbackText);
        }
      };

      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        // 检查原始文件大小限制（20MB）
        const maxFileSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxFileSize) {
          alert(`文件 ${file.name} 过大，原始文件不能超过 20MB`);
          continue;
        }

        try {
          const content = await detectAndDecodeText(file);

          // 将内容转换为UTF-8并检查转换后的大小
          const utf8Content = new TextEncoder().encode(content);
          const maxUtf8Size = 30 * 1024 * 1024; // 30MB

          if (utf8Content.byteLength > maxUtf8Size) {
            alert(`文件 ${file.name} 转换为UTF-8后过大，不能超过 30MB`);
            continue;
          }

          // 存储UTF-8格式的内容
          const utf8ContentString = new TextDecoder('utf-8').decode(utf8Content);

          const newFile: Omit<DocumentSchema, 'id' | 'createdAt' | 'updatedAt'> = {
            name: file.name,
            content: utf8ContentString,
            size: utf8Content.byteLength, // 使用UTF-8编码后的大小
            originalSize: file.size, // 保存原始文件大小
            uploadTime: new Date().toLocaleString('zh-CN'),
            status: 'draft'
          };

          await addDocument(newFile);
        } catch (error) {
          console.error('文件处理失败:', error);
          alert(`文件 ${file.name} 处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      } else {
        alert('请只上传 .txt 文件');
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  const requestDeleteFile = (id: string, fileName: string) => {
    setConfirmAction({ type: 'single', id, fileName });
    setShowConfirmModal(true);
  };

  const requestClearAll = () => {
    setConfirmAction({ type: 'all' });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === 'single' && confirmAction.id) {
        await deleteDocument(confirmAction.id);
      } else if (confirmAction.type === 'all') {
        await clearAllDocuments();
      }
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      console.error('删除操作失败:', error);
      alert('删除操作失败');
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleFileClick = (fileId: string) => {
    router.push(`/edit/${fileId}`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen">
      {/* 全局导航栏（使用默认 sticky） */}
      <GlobalNav title="文件上传平台" />

      {/* 主要内容区域 */}
      <main
        className="pt-24 pb-6 min-h-screen relative"
        style={{backgroundColor: 'var(--primary-bg)'}}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* 右上角上传按钮 */}
        <div className="fixed top-24 right-6 z-40 flex flex-col space-y-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary px-6 py-3 shadow-lg"
            type="button"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            上传文件
          </button>

          {uploadedFiles.length > 0 && (
            <button
              onClick={requestClearAll}
              className="btn-secondary px-4 py-2 shadow-lg"
            >
              清空全部
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="container mx-auto px-6 pr-32">
          {/* 拖拽提示层 */}
          {isDragOver && (
            <div className="fixed inset-0 bg-dark/20 flex items-center justify-center z-40 pointer-events-none">
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-dark/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">松开以上传文件</h3>
                  <p className="text-secondary">支持 .txt 格式文件，自动检测UTF-8/GBK编码</p>
                </div>
              </div>
            </div>
          )}

          {/* 文件列表 */}
          {uploadedFiles.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,320px))] gap-6 justify-center">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="card p-4 w-[320px] h-[320px] flex flex-col relative cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleFileClick(file.id)}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止卡片点击事件
                      requestDeleteFile(file.id, file.name);
                    }}
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 transition-colors z-10"
                    title="删除文件"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primary text-base truncate" title={file.name}>{file.name}</h3>
                      <div className="text-xs text-secondary">
                        <div>UTF-8: {formatFileSize(file.size)}</div>
                        <div>原始: {formatFileSize(file.originalSize)}</div>
                        <div>{file.uploadTime}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-light/50 rounded-lg p-3 flex-1 overflow-hidden flex flex-col">
                    <h4 className="text-xs font-semibold text-primary mb-2">文件预览:</h4>
                    <pre className="text-xs text-secondary whitespace-pre-wrap break-words overflow-y-auto flex-1">
                      {file.content.length > 300 ? file.content.substring(0, 300) + '...' : file.content}
                    </pre>
                    {file.content.length > 300 && (
                      <p className="text-xs text-muted mt-1">
                        已截断，显示前 300 字符
                      </p>
                    )}
                    <div className="mt-2 pt-2 border-t border-border-light flex items-center justify-center">
                      <span className="text-xs text-secondary flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        点击编辑
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 空状态提示 */
            <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
              <div className="text-center">
                <div className="w-24 h-24 bg-light rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-primary mb-4">开始上传您的文本文件</h2>
                <p className="text-secondary text-lg mb-6">
                  点击右上角的&quot;上传文件&quot;按钮，或直接拖拽文件到页面任意位置
                </p>
                <div className="bg-light/50 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-secondary">
                    • 支持 .txt 格式文件<br/>
                    • 自动检测UTF-8/GBK编码<br/>
                    • 原始文件最大 20MB<br/>
                    • 转换后最大 30MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 确认删除弹窗 */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-dark/50 flex items-center justify-center z-50 p-4"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* 图标 */}
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* 标题和描述 */}
            <h3 className="text-xl font-bold text-primary text-center mb-2">
              {confirmAction?.type === 'single' ? '确认删除文件' : '确认清空全部'}
            </h3>
            <p className="text-secondary text-center mb-6">
              {confirmAction?.type === 'single'
                ? `确定要删除文件 "${confirmAction.fileName}" 吗？此操作无法撤销。`
                : `确定要清空所有文件吗？共 ${uploadedFiles.length} 个文件将被删除，此操作无法撤销。`
              }
            </p>

            {/* 按钮组 */}
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-3 rounded-lg font-semibold border border-dark transition-all"
                style={{
                  color: 'var(--color-dark)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-dark)';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-dark)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-lg font-semibold transition-all text-white"
                style={{
                  backgroundColor: '#ef4444',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                }}
              >
                {confirmAction?.type === 'single' ? '删除' : '清空全部'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
