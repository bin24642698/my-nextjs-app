'use client';

import { getDB, withErrorHandling } from './connection';
import type { SystemPromptSchema } from './schema';

export class SystemPromptService {
  // 创建提示词
  static async create(prompt: Omit<SystemPromptSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<SystemPromptSchema> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const now = Date.now();
      const newPrompt: SystemPromptSchema = {
        ...prompt,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const transaction = db.transaction(['systemPrompts'], 'readwrite');
      const store = transaction.objectStore('systemPrompts');
      await new Promise<void>((resolve, reject) => {
        const request = store.add(newPrompt);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return newPrompt;
    }, 'create system prompt');
  }

  // 更新提示词
  static async update(id: string, updates: Partial<Omit<SystemPromptSchema, 'id' | 'createdAt'>>): Promise<SystemPromptSchema> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const transaction = db.transaction(['systemPrompts'], 'readwrite');
      const store = transaction.objectStore('systemPrompts');

      const existing = await new Promise<SystemPromptSchema>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
          if (!request.result) {
            reject(new Error('提示词不存在'));
          } else {
            resolve(request.result);
          }
        };
        request.onerror = () => reject(request.error);
      });

      const updated: SystemPromptSchema = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(updated);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return updated;
    }, 'update system prompt');
  }

  // 删除提示词
  static async delete(id: string): Promise<void> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const transaction = db.transaction(['systemPrompts'], 'readwrite');
      const store = transaction.objectStore('systemPrompts');

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }, 'delete system prompt');
  }

  // 获取单个提示词
  static async findById(id: string): Promise<SystemPromptSchema | null> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const transaction = db.transaction(['systemPrompts'], 'readonly');
      const store = transaction.objectStore('systemPrompts');

      return new Promise<SystemPromptSchema | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    }, 'find system prompt by id');
  }

  // 获取所有提示词
  static async getAll(): Promise<SystemPromptSchema[]> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const transaction = db.transaction(['systemPrompts'], 'readonly');
      const store = transaction.objectStore('systemPrompts');

      return new Promise<SystemPromptSchema[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const prompts = request.result || [];
          // 按更新时间倒序排序
          prompts.sort((a, b) => b.updatedAt - a.updatedAt);
          resolve(prompts);
        };
        request.onerror = () => reject(request.error);
      });
    }, 'get all system prompts');
  }

  // 按分类获取提示词
  static async findByCategory(category: string): Promise<SystemPromptSchema[]> {
    return withErrorHandling(async () => {
      const db = await getDB();
      const transaction = db.transaction(['systemPrompts'], 'readonly');
      const store = transaction.objectStore('systemPrompts');
      const index = store.index('category');

      return new Promise<SystemPromptSchema[]>((resolve, reject) => {
        const request = index.getAll(category);
        request.onsuccess = () => {
          const prompts = request.result || [];
          prompts.sort((a, b) => b.updatedAt - a.updatedAt);
          resolve(prompts);
        };
        request.onerror = () => reject(request.error);
      });
    }, 'find system prompts by category');
  }

  // 搜索提示词（标题或内容）
  static async search(keyword: string): Promise<SystemPromptSchema[]> {
    return withErrorHandling(async () => {
      const allPrompts = await this.getAll();
      const lowerKeyword = keyword.toLowerCase();

      return allPrompts.filter(prompt =>
        prompt.title.toLowerCase().includes(lowerKeyword) ||
        prompt.content.toLowerCase().includes(lowerKeyword) ||
        (prompt.description && prompt.description.toLowerCase().includes(lowerKeyword))
      );
    }, 'search system prompts');
  }
}
