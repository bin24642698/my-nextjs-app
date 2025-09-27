'use client';

let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FileUploadPlatform', 1);

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