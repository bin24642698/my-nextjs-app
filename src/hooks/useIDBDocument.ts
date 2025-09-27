'use client';
import { useState, useEffect, useCallback } from 'react';
import { DocumentService } from '@/utils/idb/documents';
import type { DocumentSchema } from '@/utils/idb/schema';

// 防抖函数
function debounce<T extends (...args: never[]) => Promise<void>>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function useIDBDocuments() {
  const [documents, setDocuments] = useState<DocumentSchema[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 加载所有文档
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await DocumentService.getAllDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 添加文档
  const addDocument = useCallback(async (doc: Omit<DocumentSchema, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDoc = await DocumentService.addDocument(doc);
      setDocuments(prev => [...prev, newDoc]);
      return newDoc;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // 删除文档
  const deleteDocument = useCallback(async (id: string) => {
    try {
      await DocumentService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // 清空所有文档
  const clearAllDocuments = useCallback(async () => {
    try {
      await DocumentService.clearAllDocuments();
      setDocuments([]);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return {
    documents,
    loading,
    error,
    addDocument,
    deleteDocument,
    clearAllDocuments,
    refreshDocuments: loadDocuments
  };
}

export function useIDBDocument(id?: string) {
  const [document, setDocument] = useState<DocumentSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 加载文档
  const loadDocument = useCallback(async (docId: string) => {
    setLoading(true);
    setError(null);
    try {
      const doc = await DocumentService.getDocumentById(docId);
      setDocument(doc);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存文档（防抖）
  const saveDocument = useCallback((updates: Partial<DocumentSchema>) => {
    if (!document) return;

    const debouncedSave = debounce(async (updatedData: Partial<DocumentSchema>) => {
      try {
        const updated = await DocumentService.updateDocument(document.id, updatedData);
        setDocument(updated);
      } catch (err) {
        setError(err as Error);
      }
    }, 500);

    debouncedSave(updates);
  }, [document]);

  useEffect(() => {
    if (id) {
      loadDocument(id);
    }
  }, [id, loadDocument]);

  return {
    document,
    loading,
    error,
    saveDocument,
    refreshDocument: () => id && loadDocument(id)
  };
}