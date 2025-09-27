'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TiptapEditor from '@/components/TiptapEditor';

interface FileData {
  id: string;
  name: string;
  content: string;
  size: number;
  originalSize: number;
  uploadTime: string;
}

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fileId = params.id as string;

    // 从 localStorage 获取文件数据
    const storedFiles = localStorage.getItem('uploadedFiles');
    if (storedFiles) {
      const files: FileData[] = JSON.parse(storedFiles);
      const file = files.find(f => f.id === fileId);
      if (file) {
        setFileData(file);
      }
    }
    setLoading(false);
  }, [params.id]);

  const handleContentChange = (newContent: string) => {
    if (!fileData) return;

    // 更新文件内容
    const updatedFile = { ...fileData, content: newContent };
    setFileData(updatedFile);

    // 更新 localStorage
    const storedFiles = localStorage.getItem('uploadedFiles');
    if (storedFiles) {
      const files: FileData[] = JSON.parse(storedFiles);
      const updatedFiles = files.map(f =>
        f.id === fileData.id ? updatedFile : f
      );
      localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
    }
  };

  const handleSave = () => {
    // 保存提示
    alert('文件已保存到本地存储');
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{backgroundColor: 'var(--primary-bg)'}}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">加载中...</p>
        </div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="h-screen flex items-center justify-center" style={{backgroundColor: 'var(--primary-bg)'}}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">文件未找到</h1>
          <button onClick={handleBack} className="btn-primary">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden" style={{backgroundColor: 'var(--primary-bg)'}}>
      {/* 顶部导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-light" style={{backgroundColor: 'rgba(251, 249, 244, 0.95)'}}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>返回</span>
              </button>
              <div className="h-6 w-px bg-border-light"></div>
              <h1 className="text-xl font-bold text-primary truncate max-w-md" title={fileData.name}>
                {fileData.name}
              </h1>
            </div>

            <button
              onClick={handleSave}
              className="btn-primary px-6 py-2"
            >
              保存
            </button>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="pt-20 pb-6 h-screen overflow-hidden">
        <div className="container mx-auto px-6 h-full flex flex-col">
          <div className="card p-6 flex-1 overflow-hidden">
            <TiptapEditor
              initialContent={fileData.content}
              onChange={handleContentChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}