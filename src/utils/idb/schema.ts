// 通用内容块（章节/设定/角色/知识库共用）
export interface ContentBlock {
  id: string;
  title: string;
  content: string;
}

// 章节数据结构
export interface Chapter extends ContentBlock {}

export type WorkItemType = 'setting' | 'character' | 'knowledge';

// 工作条目数据结构（设定/角色/知识库与章节保持一致的内容结构）
export interface WorkItem extends ContentBlock {
  documentId: string; // 所属文档ID
  createdAt: number;
  updatedAt: number;
  type: WorkItemType;
}

// 设定条目数据结构
export type SettingItem = WorkItem & { type: 'setting' };

// 角色条目数据结构
export type CharacterItem = WorkItem & { type: 'character' };

// 知识库条目数据结构
export type KnowledgeItem = WorkItem & { type: 'knowledge' };

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

// 系统提示词卡片数据结构
export interface SystemPromptSchema {
  id: string;
  title: string;
  content: string;
  description?: string;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DatabaseSchema {
  documents: DocumentSchema;
  settings: SettingsSchema;
  cache: CacheSchema;
  systemPrompts: SystemPromptSchema;
  settingItems: SettingItem;
  characterItems: CharacterItem;
  knowledgeItems: KnowledgeItem;
}