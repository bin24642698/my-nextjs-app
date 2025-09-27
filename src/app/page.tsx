'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    content: string;
    size: number;
    uploadTime: string;
  }>>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const newFile = {
            id: crypto.randomUUID(),
            name: file.name,
            content,
            size: file.size,
            uploadTime: new Date().toLocaleString('zh-CN')
          };
          setUploadedFiles(prev => [...prev, newFile]);
        };
        reader.readAsText(file);
      } else {
        alert('请只上传 .txt 文件');
      }
    });
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

  const deleteFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
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
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-light" style={{backgroundColor: 'rgba(251, 249, 244, 0.95)'}}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--color-dark)'}}>
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-primary">文件上传平台</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="pt-24 pb-20" style={{backgroundColor: 'var(--primary-bg)'}}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">

            {/* 页面标题 */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                文本文件上传工具
              </h1>
              <p className="text-xl text-secondary max-w-2xl mx-auto">
                拖拽或点击上传您的 .txt 文件，快速预览和管理文件内容
              </p>
            </div>

            {/* 文件上传区域 */}
            <div className="mb-12">
              <div
                className={`card p-12 text-center border-2 border-dashed transition-all duration-300 cursor-pointer ${
                  isDragOver ? 'border-dark bg-light/50' : 'border-light hover:border-dark/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-dark/10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">
                      {isDragOver ? '松开以上传文件' : '拖拽文件到此处或点击上传'}
                    </h3>
                    <p className="text-secondary">
                      支持 .txt 格式文件，单个文件最大 10MB
                    </p>
                  </div>

                  <button className="btn-primary px-8 py-3" type="button">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    选择文件
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* 文件列表 */}
            {uploadedFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary">
                    已上传文件 ({uploadedFiles.length})
                  </h2>
                  <button
                    onClick={() => setUploadedFiles([])}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    清空全部
                  </button>
                </div>

                <div className="grid gap-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="card p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>

                            <div>
                              <h3 className="font-semibold text-primary text-lg">{file.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-secondary">
                                <span>大小: {formatFileSize(file.size)}</span>
                                <span>上传时间: {file.uploadTime}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-light/50 rounded-lg p-4 mt-4">
                            <h4 className="text-sm font-semibold text-primary mb-2">文件预览:</h4>
                            <pre className="text-sm text-secondary whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                              {file.content.length > 500 ? file.content.substring(0, 500) + '...' : file.content}
                            </pre>
                            {file.content.length > 500 && (
                              <p className="text-xs text-muted mt-2">
                                内容已截断，显示前 500 个字符
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteFile(file.id)}
                          className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="删除文件"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 空状态提示 */}
            {uploadedFiles.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-light rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-secondary text-lg">
                  暂无上传的文件，请上传您的第一个 .txt 文件
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
