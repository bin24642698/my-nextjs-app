# rulers 
1.你优先创建和复用组件,不要每次都创建不同的代码.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个使用 Next.js 15.5.3 构建的现代化文件上传平台，专注于 .txt 文件的上传、预览和管理功能，采用 TypeScript、React 19 和 Tailwind CSS v4。

## API 目录规范

**重要规定：所有涉及服务端的操作都应该放到 `app/api` 目录下**

### API 路由组织规则：
- **登录相关 API**: 放置在 `app/api/login/` 目录
- **AI 相关 API**: 放置在 `app/api/ai/` 目录
- **用户管理 API**: 放置在 `app/api/users/` 目录
- **文件上传下载 API**: 放置在各功能模块下的 upload 子目录，如 `app/api/ai/upload/`、`app/api/users/upload/`
- **其他业务 API**: 按功能模块在 `app/api/` 下创建对应目录

### 文件上传功能特殊说明：
- **上传到云端存储**：需要在对应功能模块下创建 upload 子目录的后端 API 路由
- **上传到浏览器存储**（localStorage/IndexedDB）：无需后端 API，直接在客户端组件中处理

### API 路由示例：
```
app/api/
├── login/
│   └── route.ts           # POST /api/login
├── ai/
│   ├── chat/
│   │   └── route.ts       # POST /api/ai/chat
│   ├── analyze/
│   │   └── route.ts       # POST /api/ai/analyze
│   └── upload/
│       └── route.ts       # POST /api/ai/upload (AI相关文件上传)
└── users/
    ├── route.ts           # GET /api/users, POST /api/users
    ├── [id]/
    │   └── route.ts       # GET /api/users/[id], PUT /api/users/[id]
    └── upload/
        └── route.ts       # POST /api/users/upload (用户相关文件上传)
```

## 开发命令

### 核心命令
```bash
# 启动开发服务器（端口3000）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 运行代码检查
npm run lint
```

## 技术架构

### 技术栈
- **框架**: Next.js 15.5.3 (App Router)
- **UI框架**: React 19.1.0
- **开发语言**: TypeScript 5
- **样式系统**: Tailwind CSS v4 + 自定义CSS变量设计系统
- **存储技术**: IndexedDB (IDB) - 浏览器端本地存储
- **代码规范**: ESLint with Next.js configuration

### 项目结构
```
my-nextjs-app/
├── .claude/                    # Claude Code 配置目录
│   └── settings.local.json    # 本地权限设置
├── .git/                      # Git 版本控制
├── .next/                     # Next.js 构建输出目录
├── public/                    # 静态资源目录
│   ├── favicon.ico           # 网站图标
│   ├── favicon.svg           # SVG 图标
│   ├── favicon-16.svg        # 16px SVG 图标
│   ├── file.svg              # SVG 图标文件
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/                       # 源代码目录
│   └── app/                   # App Router 目录
│       ├── api/              # API 路由目录 (所有服务端操作)
│       │   ├── login/        # 登录相关 API
│       │   └── ai/           # AI 相关 API
│       ├── favicon.ico       # 应用图标
│       ├── globals.css       # 全局样式文件
│       ├── layout.tsx        # 根布局组件
│       └── page.tsx          # 主页组件 (文件上传界面)
├── node_modules/              # 依赖包目录
├── .gitignore                # Git 忽略配置
├── CLAUDE.md                 # Claude Code 指导文档
├── eslint.config.mjs         # ESLint 配置
├── next.config.ts            # Next.js 配置
├── next-env.d.ts             # Next.js 类型定义
├── package.json              # 项目依赖和脚本
├── package-lock.json         # 锁定依赖版本
├── postcss.config.mjs        # PostCSS 配置
├── README.md                 # 项目说明文档
└── tsconfig.json             # TypeScript 配置
```

### 架构特点
- **App Router架构**: 使用 `src/app` 目录结构
- **客户端组件**: 主页使用 'use client' 指令，包含状态管理和交互逻辑
- **路径别名**: 配置了 `@/*` 映射到 `./src/*`

### 设计系统特点
1. **颜色系统**: 基于CSS变量的米白色(`#FBF9F4`)和深黑色(`#1C1C1E`)双色主题
2. **组件样式**:
   - 使用CSS类名系统（`.btn-primary`, `.card` 等）
   - 响应式弹窗组件，支持移动端底部弹出
   - 渐变背景和阴影系统增强视觉层次
3. **字体**: 使用 Geist 和 Geist_Mono 字体

## 重要配置

### Next.js 配置 (next.config.ts)
- 明确指定 `outputFileTracingRoot` 解决多个lockfile警告
- 可扩展实验性功能配置

### TypeScript 配置
- 目标: ES2017
- 严格模式启用
- 模块解析: bundler
- JSX: preserve

### ESLint 配置
- 扩展: next/core-web-vitals, next/typescript
- 忽略: node_modules, .next, out, build, next-env.d.ts

## 核心功能实现

### 主页组件 (src/app/page.tsx)
- **文件上传功能**: 支持拖拽和点击上传 .txt 文件
- **文件预览**: 实时预览上传文件内容（前500字符）
- **文件管理**: 显示文件信息（名称、大小、上传时间）和删除功能
- **响应式设计**: 适配桌面端和移动端
- **交互优化**:
  - 拖拽上传提示
  - 文件格式验证
  - 空状态展示
- **UI 组件**: 使用卡片布局，保持设计一致性

## 开发注意事项

1. **样式开发**: 优先使用已定义的CSS变量和工具类，保持设计一致性
2. **组件开发**: 新组件应遵循现有的命名规范和结构模式
3. **性能优化**: Next.js 自动进行代码分割和优化
4. **类型安全**: 充分利用TypeScript的类型系统

## 代码风格

### 0. 总原则（写代码的"刻度"）

#### 默认服务端、最小化客户端
以 Server Component 为默认，仅当需要"交互、状态、浏览器 API、Tiptap 编辑器"等时，才用 Client 组件，并显式 `use client`。这样减少打包体积和水合成本。

#### 边界清晰
把"交互叶子节点"做成 Client 组件；上层布局、数据拼装保持为 Server 组件。避免在高层加 `use client` 造成"整棵子树都上客户端"的连带开销。

#### 先可读，再优化
优先直观数据流与小而专一的组件；性能优化（例如 memo 化、懒加载）在 Profile 后"有据可依"地做。

#### 拥抱框架默认行为
Next 15 中 fetch 默认不缓存、GET 路由处理器默认不缓存；路由切换对 Page 的客户端缓存默认 `staleTime: 0`。按需通过 `cache`、`next.revalidate`、`revalidateTag/revalidatePath` 显式配置。

#### 用好 React 19 的表单与乐观更新
行为型变更优先采用 `useActionState`、`useOptimistic` 与 `<form action={fn}>` 的模式，减少手写"加载/错误/回滚"样板。

### 1. 语言、Lint 与格式化

#### TypeScript（强约束）
- 开启：`"strict": true`、`"noUncheckedIndexedAccess": true`、`"exactOptionalPropertyTypes": true`
- Props 使用具名类型别名或 interface；禁止 any/unknown 逃逸到公共 API
- 对 DOM 透传 `...rest` 时使用 `ComponentPropsWithoutRef<'button'>` 等精确约束，避免把不合法属性传进原生节点

#### ESLint & Prettier
- **ESLint**：基于 next/core-web-vitals、@typescript-eslint、react-hooks、eslint-plugin-import、unused-imports。Next 15 支持 ESLint 9（Flat Config 可选，保留对旧配置的兼容），团队可统一一个即可
- **Prettier** 只做格式化；风格性规则交给 ESLint（避免冲突）

#### 关键规则建议
- `@typescript-eslint/consistent-type-imports: "error"`（统一 import type）
- `import/order`：builtin → external → internal(@/*) → parent/sibling；分组间空行 + 字母序
- `unused-imports/no-unused-imports: "error"`
- 禁止默认导出（除 page.tsx / layout.tsx 等 Next 约定文件外），便于重构和命名引用

#### Commit / 注释
- 提交信息用 Conventional Commits（如 `feat(ui): add Button`）
- 公共导出的组件/Hook 使用 TSDoc 注释，描述可见性与副作用

### 2. 文件、命名与导入

- **命名**：组件/类型 PascalCase；文件名与默认导出保持一致；Hooks 必须 useXxx
- **扩展名**：React 文件统一 .tsx；纯工具/类型 .ts
- **路径**：使用 @/ 别名做绝对导入；禁止 ../../..
- **导入顺序**：Node 内置 → 第三方 → @/ → 相对路径；同组内按字母序
- **导出**：命名导出优先；避免大型 index"桶文件"导致循环依赖与误打包

### 3. 组件风格（复用优先）

#### 3.1 何时用 Client 组件
- 只要有：状态/副作用/事件处理/浏览器 API/第三方仅浏览器可用的库（如 Tiptap），才使用 `use client`
- Client 组件应尽量叶子化：将其放到需要交互的最底层，避免"无辜上客户端"

#### 3.2 Props 约定
- 尽量不在渲染树深处传递过多布尔开关；复杂配置聚合成 options 对象
- 事件回调统一 onXxx，返回 `void | Promise<void>`；异步错误向上抛给 Error Boundary
- className 放最后，合并时使用工具（例如 clsx）并保证最右覆盖
- 组件需要可组合时：支持 as 或 children 的 slot（不强依赖某 UI 库也能组合）

#### 3.3 可复用按钮（示例片段）
```tsx
// Button.tsx（Client 组件：存在事件）
'use client';
import React, { forwardRef } from 'react';

export interface ButtonProps extends
  React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, ...rest }, ref) => (
    <button
      ref={ref}
      data-variant={variant}
      className={className}
      {...rest}
    />
  )
);
Button.displayName = 'Button';
```

**说明**：保持最小 DOM、转发 ref、无多余包装，让样式系统或上层容器决定外观层级。

#### 3.4 Provider 组合（避免"Context 套娃"）
把多个全局 Provider 通过组合工具一次性包裹，避免层层嵌套影响可读性：

```tsx
export function composeProviders<T extends React.ComponentType<any>[]>(
  ...providers: T
) {
  return function Providers({ children }: { children: React.ReactNode }) {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );
  };
}
```

### 4. 性能风格（包含"优化嵌套"）

#### 4.1 让框架帮你省事
- **数据与缓存**：fetch 默认不缓存，如需缓存用 `{ cache: 'force-cache' }`；按需指定 `next: { revalidate }` 或标签化 `next: { tags }`，配合 `revalidateTag/revalidatePath` 进行事件化刷新。不要到处造全局缓存
- **Request API 异步化**：在 Next 15 中 `cookies()/headers()/params/searchParams` 等涉及请求的 API 应使用 await（迁移到异步版本）

#### 4.2 嵌套最小化
- 少包一层就是优化：避免"装饰性 `<div>` 套娃"，能用 CSS 实现的间距不新增容器
- 布局/导航保留在 layout.tsx，内容在 page.tsx；交互叶子再下沉为 Client 组件
- 复合组件尽量无额外 DOM（如 slot/asChild 模式），降低 DOM 深度与样式优先级冲突

#### 4.3 React 级优化
- 先写直觉逻辑，再按 Profiler 决定是否 `React.memo/useMemo/useCallback`
- 若团队启用 React Compiler（实验），减少手写 memo 化（Compiler 会自动优化重渲染），只保留必要的稳定引用与不可变数据结构约束
- 列表渲染 key 稳定；长列表使用虚拟化（场景合适才引入库）

#### 4.4 懒加载与跳过 SSR（仅限 Client 组件）
对仅浏览器可用且体积大的库（如 Tiptap、图表类库），在 Client 组件内使用 `next/dynamic` 懒加载，必要时 `ssr: false` 跳过预渲染，降低水合复杂度与首屏包体。注意：`ssr: false` 只在 Client 组件里生效。

### 5. Tiptap 专项风格（性能 + 复用 + 安全）

#### 5.1 初始化与分层
- **编辑器是 Client 组件**：必须 `use client`
- **隔离渲染**：编辑器本体（EditorContent + useEditor）放在单独组件里，侧栏/工具栏/外部状态不要与其同组件渲染，避免每次输入导致整块 UI 重渲染。可用 `useEditorState` 选择性订阅状态
- **SSR/Hydration**：如遇水合告警或"SSR 检测"提示，可在初始化时显式设置 `immediatelyRender: false` 或按需控制 `shouldRerenderOnTransaction`，并且将 Tiptap 组件通过 `next/dynamic(..., { ssr: false })` 作为客户端懒加载（从 Client 边界调用）

#### 5.2 扩展与状态稳定
- `extensions` 列表与较重的配置用 `useMemo` 固定；editor 实例引用使用 `useRef` 保存
- 工具栏按钮仅读取必要的状态切片（如是否加粗），通过命令链 `editor.chain().focus().toggleBold().run()` 执行，避免把 editor 整体通过 Context 广播给过多子组件（或者用 `useEditorState` 的 selector 精确订阅）
- 文本变化事件 `onUpdate` 建议节流/防抖（如 300ms），降低上游 API 调用频率

#### 5.3 序列化与安全
存储格式建议以 JSON 为主，HTML 作为派生输出（便于在非编辑场景渲染/导出），两者都必须做输入校验；Tiptap 官方说明"选择 JSON 或 HTML不是安全性决定因素，务必在服务端验证用户输入"。前端渲染外部 HTML 时使用可信白名单或 DOMPurify 之类的净化策略。

#### 5.4 组件复用模式
- **EditorShell**（承载 EditorContent 的最小组件，管理生命周期与销毁）
- **Toolbar**（纯 UI，依赖 useEditorState 订阅的状态切片，不直接持有冗余全局状态）
- **BubbleMenu/FloatingMenu** 可抽为独立小组件，按需挂载与拆卸，避免常驻监听

### 6. 数据获取、表单与 AI 交互（前端侧风格）

- **读取数据**：在 Server 组件里直接 await 数据（或 use 解包 promise），并用 `{ next: { revalidate } }` 或标签化方式控制失效；避免把"纯读"放到 useEffect
- **变更（提交/保存）**：优先使用 React 19 风格的 `<form action={fn}>` + `useActionState` + `useOptimistic` 管理 pending、错误与乐观 UI，减少样板。适配 Next 的 Server Actions 时，函数体用 `"use server"` 标注（放 Server/或独立可复用文件），客户端通过表单 action 或显式调用触发
- **AI 流式输出**：前端消费流时使用 ReadableStream + 按行解析（SSE/分块），缓冲后再批量 setState，避免字符级 setState 造成高频重渲染；暴露 AbortController 用于取消

### 6.1 IndexedDB (IDB) 存储规范

#### 6.1.1 使用场景与原则
- **离线优先**：用于缓存用户数据、草稿内容、离线状态管理
- **大数据存储**：超过 localStorage 5MB 限制的结构化数据
- **事务安全**：需要原子性操作的复杂数据更新
- **客户端组件专用**：IndexedDB 仅在浏览器环境可用，必须在 Client 组件中使用

#### 6.1.2 数据库设计模式
```tsx
// utils/idb/schema.ts
export interface DocumentSchema {
  id: string;
  title: string;
  content: any; // Tiptap JSON 格式
  createdAt: number;
  updatedAt: number;
  tags: string[];
  status: 'draft' | 'published';
}

export interface DatabaseSchema {
  documents: DocumentSchema;
  settings: { key: string; value: any };
  cache: { url: string; data: any; expires: number };
}
```

#### 6.1.3 连接与初始化（单例模式）
```tsx
// utils/idb/connection.ts
'use client';
import { DBSchema, openDB, IDBPDatabase } from 'idb';

let dbInstance: IDBPDatabase<DatabaseSchema> | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<DatabaseSchema>('MyApp', 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // 版本迁移逻辑
      if (oldVersion < 1) {
        const documentStore = db.createObjectStore('documents', { keyPath: 'id' });
        documentStore.createIndex('status', 'status');
        documentStore.createIndex('updatedAt', 'updatedAt');

        db.createObjectStore('settings', { keyPath: 'key' });
        db.createObjectStore('cache', { keyPath: 'url' });
      }
    },
  });

  return dbInstance;
}
```

#### 6.1.4 CRUD 操作模式
```tsx
// utils/idb/documents.ts
'use client';
import { getDB } from './connection';

export class DocumentService {
  // 创建文档
  static async create(doc: Omit<DocumentSchema, 'id' | 'createdAt' | 'updatedAt'>) {
    const db = await getDB();
    const now = Date.now();
    const newDoc: DocumentSchema = {
      ...doc,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await db.add('documents', newDoc);
    return newDoc;
  }

  // 更新文档（乐观更新）
  static async update(id: string, updates: Partial<DocumentSchema>) {
    const db = await getDB();
    const tx = db.transaction('documents', 'readwrite');

    const existing = await tx.store.get(id);
    if (!existing) throw new Error('Document not found');

    const updated = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    await tx.store.put(updated);
    await tx.done;
    return updated;
  }

  // 批量查询（支持索引）
  static async findByStatus(status: DocumentSchema['status']) {
    const db = await getDB();
    return db.getAllFromIndex('documents', 'status', status);
  }

  // 分页查询
  static async list(limit = 20, cursor?: string) {
    const db = await getDB();
    const tx = db.transaction('documents', 'readonly');
    const index = tx.store.index('updatedAt');

    let items: DocumentSchema[] = [];
    let cursorResult = await index.openCursor(null, 'prev');

    // 跳过到指定cursor
    if (cursor && cursorResult) {
      cursorResult = await cursorResult.advance(parseInt(cursor));
    }

    while (cursorResult && items.length < limit) {
      items.push(cursorResult.value);
      cursorResult = await cursorResult.continue();
    }

    return { items, nextCursor: items.length === limit ? items.length.toString() : null };
  }
}
```

#### 6.1.5 React Hook 集成
```tsx
// hooks/useIDBDocument.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { DocumentService } from '@/utils/idb/documents';

export function useIDBDocument(id?: string) {
  const [document, setDocument] = useState<DocumentSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 加载文档
  const loadDocument = useCallback(async (docId: string) => {
    setLoading(true);
    setError(null);
    try {
      const doc = await DocumentService.findById(docId);
      setDocument(doc);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存文档（防抖）
  const saveDocument = useCallback(
    debounce(async (updates: Partial<DocumentSchema>) => {
      if (!document) return;
      try {
        const updated = await DocumentService.update(document.id, updates);
        setDocument(updated);
      } catch (err) {
        setError(err as Error);
      }
    }, 500),
    [document]
  );

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
    refreshDocument: () => id && loadDocument(id),
  };
}
```

#### 6.1.6 缓存策略与过期
```tsx
// utils/idb/cache.ts
'use client';
import { getDB } from './connection';

export class CacheService {
  // 设置缓存（带过期时间）
  static async set(key: string, data: any, ttl = 3600000) { // 默认1小时
    const db = await getDB();
    await db.put('cache', {
      url: key,
      data,
      expires: Date.now() + ttl,
    });
  }

  // 获取缓存（自动过期清理）
  static async get(key: string) {
    const db = await getDB();
    const cached = await db.get('cache', key);

    if (!cached) return null;

    if (cached.expires < Date.now()) {
      // 过期删除
      await db.delete('cache', key);
      return null;
    }

    return cached.data;
  }

  // 清理过期缓存
  static async cleanup() {
    const db = await getDB();
    const tx = db.transaction('cache', 'readwrite');
    const now = Date.now();

    let cursor = await tx.store.openCursor();
    while (cursor) {
      if (cursor.value.expires < now) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }

    await tx.done;
  }
}
```

#### 6.1.7 错误处理与边界
```tsx
// utils/idb/errorHandler.ts
'use client';

export class IDBErrorHandler {
  // 检查 IndexedDB 可用性
  static isAvailable(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  // 统一错误处理
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T | null> {
    if (!this.isAvailable()) {
      console.error(`IndexedDB not available for operation: ${operationName}`);
      throw new Error('IndexedDB not supported in this environment');
    }

    try {
      return await operation();
    } catch (error) {
      console.error(`IDB operation failed [${operationName}]:`, error);

      // 根据错误类型决定是否重试
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'QuotaExceededError':
            throw new Error('Storage quota exceeded. Please free up space.');
          case 'InvalidStateError':
            throw new Error('Database is in an invalid state. Please refresh.');
          case 'AbortError':
            console.warn('Operation was aborted, retrying...');
            return await operation(); // 单次重试
          default:
            throw error;
        }
      }

      throw error;
    }
  }

  // 数据库版本冲突处理
  static handleVersionError(error: any): never {
    if (error.name === 'VersionError') {
      throw new Error('Database version conflict. Please refresh the page.');
    }
    throw error;
  }
}
```

#### 6.1.8 最佳实践总结
- **事务管理**：批量操作使用显式事务，避免自动提交的性能开销
- **索引优化**：为常用查询字段创建索引，避免全表扫描
- **版本迁移**：升级数据库结构时提供向下兼容的迁移逻辑
- **错误边界**：IDB 操作必须包含 try-catch，明确错误类型和用户提示
- **内存管理**：大量数据操作后主动关闭连接，避免内存泄漏
- **并发控制**：同一数据的读写使用事务串行化，避免竞态条件
- **环境检测**：应用启动时检查 IndexedDB 可用性，不可用时禁用相关功能

### 7. CSS 样式规范（基于全局样式系统）

#### 7.1 CSS 变量系统优先
- **统一色彩体系**：严格使用 CSS 变量，禁止硬编码颜色值
  - 主色调：`var(--color-light)` 米白色 (#FBF9F4) 和 `var(--color-dark)` 深黑色 (#1C1C1E)
  - 文字颜色：`var(--primary-text)`、`var(--secondary-text)`、`var(--muted-text)`
  - 背景色：`var(--primary-bg)`、`var(--secondary-bg)`
  - 边框色：`var(--border-light)`、`var(--border-medium)`、`var(--border-dark)`

```css
/* ✅ 正确 - 使用 CSS 变量 */
.custom-component {
  background: var(--primary-bg);
  color: var(--primary-text);
  border: 1px solid var(--border-light);
}

/* ❌ 错误 - 硬编码颜色 */
.custom-component {
  background: #FBF9F4;
  color: #1C1C1E;
  border: 1px solid #e9ecef;
}
```

#### 7.2 预定义组件类优先复用
- **按钮系统**：使用 `.btn-primary` 和 `.btn-secondary` 类，不自定义按钮样式
- **卡片系统**：使用 `.card` 类，自动包含悬停效果和阴影系统
- **工具类**：优先使用预定义的 `.text-*`、`.bg-*`、`.border-*`、`.shadow-custom-*` 类

```tsx
// ✅ 正确 - 复用预定义类
<button className="btn-primary">
  主要按钮
</button>
<div className="card">
  <h3 className="text-primary">卡片标题</h3>
  <p className="text-secondary">卡片内容</p>
</div>

// ❌ 错误 - 重复定义样式
<button className="custom-primary-btn">
  主要按钮
</button>
<div className="custom-card-style">
  内容
</div>
```

#### 7.3 阴影和过渡系统
- **统一阴影**：使用 `var(--shadow-sm/md/lg/xl)` 变量，基于主色调的透明度
- **过渡动画**：所有交互元素使用 `transition: all 0.3s ease`，小型交互使用 `0.2s`
- **变换效果**：悬停使用 `translateY(-2px)` 提升，点击可用 `scale(0.98)` 反馈

```css
/* ✅ 标准过渡和阴影模式 */
.interactive-element {
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### 7.4 响应式设计规范
- **断点使用**：移动端 `max-width: 768px`，小屏幕 `max-width: 480px`
- **弹窗适配**：移动端自动转为底部弹出模式，使用预定义的 `.modal-*` 类
- **表单布局**：桌面端使用 `.form-row` 双列布局，移动端自动单列

```css
/* 遵循现有响应式模式 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr; /* 移动端单列 */
  }

  .modal-container {
    border-radius: 16px 16px 0 0; /* 底部弹出圆角 */
  }
}
```

#### 7.5 表单元素样式一致性
- **表单组件**：使用 `.form-input`、`.form-textarea`、`.form-select` 类
- **焦点状态**：统一的 `border-color: var(--color-dark)` 和 `box-shadow: 0 0 0 3px rgba(28, 28, 30, 0.1)`
- **占位符**：使用 `var(--muted-text)` 颜色

#### 7.6 自定义样式约束
- **新增样式时**：先检查是否有对应的 CSS 变量或工具类可复用
- **颜色值**：禁止直接使用十六进制或 RGB 值，必须基于 CSS 变量系统
- **动画性能**：优先使用 `transform` 和 `opacity` 变换，避免改变布局属性
- **Z-index 层级**：弹窗使用 `z-index: 9999`，其他浮层按需递减

### 8. 可访问性（a11y）与国际化（i18n）

- 交互元素必须可聚焦；对应标签+控件使用 label/htmlFor；键盘可达
- 富文本工具栏按钮需有 aria-pressed / aria-label 等状态与描述；编辑区域提供语义 role="textbox"（若自定义包装）与快捷键说明页
- 文案一律通过字典函数输出（杜绝字符串拼接在组件内硬编码）

### 9. 错误边界与空/加载态

- 路由级错误用 error.tsx，空态/加载态使用 not-found.tsx / loading.tsx
- Client 组件的不可恢复错误使用 Error Boundary 包裹；所有异步事件需显式捕获并反馈 UI
- 表单使用 useFormStatus 显示提交状态，避免手写多个 pending flag

### 10. 代码示例（与 Next 15 行为对齐）

#### (1) 在 Server 组件中读取 cookie（Next 15 异步化 API）

```tsx
// app/(dashboard)/page.tsx  —— Server 组件
import { cookies } from 'next/headers';

export default async function Page() {
  const store = await cookies(); // Next 15: 异步 API
  const token = store.get('token')?.value;
  // ...
  return <div>...</div>;
}
```

**说明**：Next 15 将请求相关 API 迁移为异步；应 await。

#### (2) 服务端读取 + 显式缓存策略

```tsx
// 「读」接口的粒度缓存（页面或 Server 组件内）
async function getDocs() {
  const res = await fetch(process.env.NEXT_PUBLIC_API + '/docs', {
    // 需要缓存时才开启；否则保持默认不缓存
    next: { revalidate: 60, tags: ['docs'] },
  });
  return res.json();
}
```

用 `revalidateTag('docs')` 触发事件化刷新。

#### (3) Tiptap 编辑器包装（Client 组件 + 隔离）

```tsx
// components/editor/EditorShell.tsx
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export function EditorShell({
  content,
  onChange,
}: { content?: any; onChange?: (json: object) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    // 避免某些 SSR/Hydration 场景下的立即渲染
    immediatelyRender: false,
    // 减少每次交易都重渲染
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor }) => {
      // 这里建议做防抖
      onChange?.(editor.getJSON());
    },
  });

  return <EditorContent editor={editor} />;
}
```

**关键**：隔离编辑器；控制 `immediatelyRender/shouldRerenderOnTransaction`；在上层用 `next/dynamic` 懒加载此组件。

#### (4) 在 Client 组件内懒加载编辑器，必要时跳过 SSR

```tsx
// components/editor/LazyEditor.tsx
'use client';
import dynamic from 'next/dynamic';

export const LazyEditor = dynamic(
  () => import('./EditorShell'),
  { ssr: false } // 仅在 Client 组件层可用
);
```

避免在 Server 组件里使用 `ssr: false`。

#### (5) React 19 表单风格（更少样板）

```tsx
// Client 组件
import { useActionState } from 'react';

export default function SaveForm() {
  const [error, submit, pending] = useActionState(
    async (_prev, formData: FormData) => {
      // 调用后端或 Server Action
      // 失败返回错误消息，成功返回 null
      return null;
    },
    null
  );

  return (
    <form action={submit}>
      <button type="submit" disabled={pending}>Save</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

建议把真实写入逻辑放 Server 侧（Server Actions/路由处理器），前端只做动作触发与反馈。

### 11. 测试与可维护性（风格）

- **单元/组件测试**：优先 React Testing Library；只测可观察行为，不测内部实现
- **E2E**：Playwright 编写"关键信道（写作-保存-预览）"的冒烟用例
- **快照**：仅用于稳定的 UI 片段；避免把快照当"断言大锤"

### 12. 最小配置建议（片段）

#### ESLint（.eslintrc.json，传统配置范式）

```json
{
  "extends": [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  "plugins": ["unused-imports"],
  "rules": {
    "@typescript-eslint/consistent-type-imports": "error",
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }
    ],
    "unused-imports/no-unused-imports": "error"
  }
}
```

#### tsconfig（关键选项）

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}
```

### 13. 落地清单（Checklist）

- [ ] 默认用 Server 组件，仅在需要交互时加 `use client`
- [ ] 组件保持小而专一；Props 语义化，不滥用布尔开关
- [ ] Tiptap：隔离编辑器；大依赖动态导入；必要时 `ssr:false` 只在 Client 组件层使用
- [ ] fetch 的缓存/再验证显式配置（`cache` / `next.revalidate` / 标签）
- [ ] Next 15 的 `cookies()/headers()/params` 等使用异步 API
- [ ] 表单优先 `<form action={fn}>` + `useActionState/useOptimistic`；减少手写 pending/错误
- [ ] ESLint + Prettier 到位；TypeScript strict 打满
- [ ] 复杂 Provider 用组合工具降低嵌套；DOM 结构不多包一层
- [ ] 流式输出按块更新 UI，暴露取消；避免高频 setState
- [ ] CSS 样式严格使用变量系统，禁止硬编码颜色值
- [ ] 优先复用预定义的 `.btn-*`、`.card`、`.form-*` 等组件类
- [ ] 交互元素统一使用 `transition: all 0.3s ease` 和标准阴影系统
- [ ] 响应式设计遵循 768px/480px 断点，弹窗移动端底部弹出模式
- [ ] Tiptap 存储 JSON 为主、HTML 为辅，两者都需输入校验与净化
- [ ] IndexedDB 仅在 Client 组件中使用，环境检测后启用相关功能
- [ ] IDB 操作使用事务管理，为常用查询创建索引
- [ ] 大数据存储优先使用 IDB，明确错误处理和用户提示
- [ ] 实现数据版本迁移逻辑，确保向下兼容性