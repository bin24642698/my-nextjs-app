'use client';

let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FileUploadPlatform', 3); // 升级版本号到3

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建文档存储
      if (!db.objectStoreNames.contains('documents')) {
        const documentStore = db.createObjectStore('documents', { keyPath: 'id' });
        documentStore.createIndex('name', 'name', { unique: false });
        documentStore.createIndex('uploadTime', 'uploadTime', { unique: false });
        documentStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        documentStore.createIndex('status', 'status', { unique: false });
      }

      // 创建设置存储
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // 创建缓存存储
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'url' });
      }

      // 创建系统提示词存储
      if (!db.objectStoreNames.contains('systemPrompts')) {
        const promptStore = db.createObjectStore('systemPrompts', { keyPath: 'id' });
        promptStore.createIndex('title', 'title', { unique: false });
        promptStore.createIndex('category', 'category', { unique: false });
        promptStore.createIndex('createdAt', 'createdAt', { unique: false });
        promptStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // 创建设定条目存储
      if (!db.objectStoreNames.contains('settingItems')) {
        const settingStore = db.createObjectStore('settingItems', { keyPath: 'id' });
        settingStore.createIndex('documentId', 'documentId', { unique: false });
        settingStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // 创建角色条目存储
      if (!db.objectStoreNames.contains('characterItems')) {
        const characterStore = db.createObjectStore('characterItems', { keyPath: 'id' });
        characterStore.createIndex('documentId', 'documentId', { unique: false });
        characterStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // 创建知识库条目存储
      if (!db.objectStoreNames.contains('knowledgeItems')) {
        const knowledgeStore = db.createObjectStore('knowledgeItems', { keyPath: 'id' });
        knowledgeStore.createIndex('documentId', 'documentId', { unique: false });
        knowledgeStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}

// 检查 IndexedDB 可用性
export function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

// 错误处理
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB not supported in this environment');
  }

  try {
    return await operation();
  } catch (error) {
    console.error(`IDB operation failed [${operationName}]:`, error);

    if (error instanceof DOMException) {
      switch (error.name) {
        case 'QuotaExceededError':
          throw new Error('存储配额已满，请释放空间');
        case 'InvalidStateError':
          throw new Error('数据库状态异常，请刷新页面');
        case 'AbortError':
          console.warn('操作被中止，正在重试...');
          return await operation(); // 单次重试
        default:
          throw error;
      }
    }

    throw error;
  }
}