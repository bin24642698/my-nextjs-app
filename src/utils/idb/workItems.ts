'use client';

import { getDB } from './connection';
import type { SettingItem, CharacterItem, KnowledgeItem } from './schema';

// 设定条目服务
export class SettingItemService {
  // 获取指定文档的所有设定
  static async getByDocumentId(documentId: string): Promise<SettingItem[]> {
    const db = await getDB();
    const tx = db.transaction('settingItems', 'readonly');
    const index = tx.objectStore('settingItems').index('documentId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(documentId);
      request.onsuccess = () => {
        const items = (request.result as SettingItem[]).map(item => ({
          ...item,
          title: item.title ?? '未命名设定',
          type: 'setting',
        }));
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 创建新设定
  static async create(item: Omit<SettingItem, 'id' | 'createdAt' | 'updatedAt' | 'type'>): Promise<SettingItem> {
    const db = await getDB();
    const now = Date.now();
    const newItem: SettingItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      type: 'setting',
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('settingItems', 'readwrite');
      const request = tx.objectStore('settingItems').add(newItem);
      request.onsuccess = () => resolve(newItem);
      request.onerror = () => reject(request.error);
    });
  }

  // 更新设定
  static async update(id: string, updates: Partial<SettingItem>): Promise<SettingItem> {
    const db = await getDB();
    const tx = db.transaction('settingItems', 'readwrite');
    const store = tx.objectStore('settingItems');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error('Setting not found'));
          return;
        }

        const updated: SettingItem = {
          ...existing,
          ...updates,
          id, // 确保ID不变
          updatedAt: Date.now(),
          type: 'setting',
          title: updates.title ?? existing.title ?? '未命名设定',
        };

        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // 删除设定
  static async delete(id: string): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settingItems', 'readwrite');
      const request = tx.objectStore('settingItems').delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// 角色条目服务
export class CharacterItemService {
  static async getByDocumentId(documentId: string): Promise<CharacterItem[]> {
    const db = await getDB();
    const tx = db.transaction('characterItems', 'readonly');
    const index = tx.objectStore('characterItems').index('documentId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(documentId);
      request.onsuccess = () => {
        const items = (request.result as (CharacterItem & { name?: string })[]).map(item => ({
          ...item,
          title: item.title ?? item.name ?? '未命名角色',
          type: 'character',
        }));
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  static async create(item: Omit<CharacterItem, 'id' | 'createdAt' | 'updatedAt' | 'type'>): Promise<CharacterItem> {
    const db = await getDB();
    const now = Date.now();
    const newItem: CharacterItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      type: 'character',
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('characterItems', 'readwrite');
      const request = tx.objectStore('characterItems').add(newItem);
      request.onsuccess = () => resolve(newItem);
      request.onerror = () => reject(request.error);
    });
  }

  static async update(id: string, updates: Partial<CharacterItem>): Promise<CharacterItem> {
    const db = await getDB();
    const tx = db.transaction('characterItems', 'readwrite');
    const store = tx.objectStore('characterItems');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error('Character not found'));
          return;
        }

        const updated: CharacterItem = {
          ...existing,
          ...updates,
          id,
          updatedAt: Date.now(),
          type: 'character',
          title: updates.title ?? existing.title ?? (existing as any).name ?? '未命名角色',
        };

        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  static async delete(id: string): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('characterItems', 'readwrite');
      const request = tx.objectStore('characterItems').delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// 知识库条目服务
export class KnowledgeItemService {
  static async getByDocumentId(documentId: string): Promise<KnowledgeItem[]> {
    const db = await getDB();
    const tx = db.transaction('knowledgeItems', 'readonly');
    const index = tx.objectStore('knowledgeItems').index('documentId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(documentId);
      request.onsuccess = () => {
        const items = (request.result as KnowledgeItem[]).map(item => ({
          ...item,
          title: item.title ?? '未命名知识',
          type: 'knowledge',
        }));
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  static async create(item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt' | 'type'>): Promise<KnowledgeItem> {
    const db = await getDB();
    const now = Date.now();
    const newItem: KnowledgeItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      type: 'knowledge',
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('knowledgeItems', 'readwrite');
      const request = tx.objectStore('knowledgeItems').add(newItem);
      request.onsuccess = () => resolve(newItem);
      request.onerror = () => reject(request.error);
    });
  }

  static async update(id: string, updates: Partial<KnowledgeItem>): Promise<KnowledgeItem> {
    const db = await getDB();
    const tx = db.transaction('knowledgeItems', 'readwrite');
    const store = tx.objectStore('knowledgeItems');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error('Knowledge not found'));
          return;
        }

        const updated: KnowledgeItem = {
          ...existing,
          ...updates,
          id,
          updatedAt: Date.now(),
          type: 'knowledge',
          title: updates.title ?? existing.title ?? '未命名知识',
        };

        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  static async delete(id: string): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('knowledgeItems', 'readwrite');
      const request = tx.objectStore('knowledgeItems').delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
