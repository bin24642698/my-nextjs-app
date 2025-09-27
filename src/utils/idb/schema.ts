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