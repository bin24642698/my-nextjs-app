// 章节数据结构
export interface Chapter {
  id: string;
  title: string;
  content: string;
}

// IndexedDB 数据库结构定义
export interface DocumentSchema {
  id: string;
  name: string;
  content: string;
  size: number;
  originalSize: number;
  uploadTime: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  status: 'draft' | 'published';
  chapters?: Chapter[]; // 新增章节支持
  currentChapterId?: string; // 当前选中的章节ID
}

export interface SettingsSchema {
  key: string;
  value: unknown;
}

export interface CacheSchema {
  url: string;
  data: unknown;
  expires: number;
}

export interface DatabaseSchema {
  documents: DocumentSchema;
  settings: SettingsSchema;
  cache: CacheSchema;
}