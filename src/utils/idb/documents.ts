'use client';
import { getDB, withErrorHandling } from './connection';
import type { DocumentSchema } from './schema';

export class DocumentService {
  // 获取所有文档
  static async getAllDocuments(): Promise<DocumentSchema[]> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const transaction = db.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');

      return new Promise<DocumentSchema[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }, 'getAllDocuments');
  }

  // 根据ID获取文档
  static async getDocumentById(id: string): Promise<DocumentSchema | null> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const transaction = db.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');

      return new Promise<DocumentSchema | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    }, 'getDocumentById');
  }

  // 添加文档
  static async addDocument(doc: Omit<DocumentSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentSchema> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const transaction = db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');

      const now = Date.now();
      const newDoc: DocumentSchema = {
        ...doc,
        id: crypto.randomUUID(), // 生成唯一ID
        createdAt: now,
        updatedAt: now,
        status: doc.status || 'draft'
      };

      return new Promise<DocumentSchema>((resolve, reject) => {
        const request = store.add(newDoc);
        request.onsuccess = () => resolve(newDoc);
        request.onerror = () => reject(request.error);
      });
    }, 'addDocument');
  }

  // 更新文档
  static async updateDocument(id: string, updates: Partial<DocumentSchema>): Promise<DocumentSchema> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const transaction = db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');

      return new Promise<DocumentSchema>((resolve, reject) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const existingDoc = getRequest.result;
          if (!existingDoc) {
            reject(new Error('Document not found'));
            return;
          }

          const updatedDoc: DocumentSchema = {
            ...existingDoc,
            ...updates,
            updatedAt: Date.now()
          };

          const putRequest = store.put(updatedDoc);
          putRequest.onsuccess = () => resolve(updatedDoc);
          putRequest.onerror = () => reject(putRequest.error);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    }, 'updateDocument');
  }

  // 删除文档
  static async deleteDocument(id: string): Promise<void> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const transaction = db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');

      return new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }, 'deleteDocument');
  }

  // 删除所有文档
  static async clearAllDocuments(): Promise<void> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const transaction = db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');

      return new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }, 'clearAllDocuments');
  }
}