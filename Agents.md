1.你优先创建和复用组件,不要每次都创建不同的代码.
2.你尽量复用,调用组件和模块,而不是生成新代码.
3.所有后端的功能,你都必须放到app/api目录中,如登录功能你必须放到app/api/auth/login中,AI功能要放到app/api/AI/API当中,以此类推.
4.C:\Users\Bin\Downloads\supabase\supabase-project 是我的supabase项目.可以看到supabase的信息.

## 代码风格示例

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
