'use client';

// 中文说明：提供对 IndexedDB 中 settings 表的读写封装
import { getDB, withErrorHandling } from './connection';

export class SettingsService {
  // 中文说明：读取某个设置项
  static async get<T = unknown>(key: string): Promise<T | null> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const tx = db.transaction(['settings'], 'readonly');
      const store = tx.objectStore('settings');
      return await new Promise<T | null>((resolve, reject) => {
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && typeof req.result === 'object' && 'value' in req.result) {
            resolve((req.result as { value: T }).value ?? null);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => reject(req.error);
      });
    }, 'settings.get');
  }

  // 中文说明：写入某个设置项
  static async set<T = unknown>(key: string, value: T): Promise<void> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const tx = db.transaction(['settings'], 'readwrite');
      const store = tx.objectStore('settings');
      const record = { key, value } as { key: string; value: T };
      return await new Promise<void>((resolve, reject) => {
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }, 'settings.set');
  }
}

