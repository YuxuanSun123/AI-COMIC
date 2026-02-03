# 优化方案：从 localStorage 迁移到 Modern Async Architecture

本文档详细说明了如何将项目的数据持久化层从同步的 `localStorage` 迁移到高性能的异步架构 (IndexedDB + React Query)。

## 1. 现状分析与瓶颈

目前 `src/lib/tableApi.ts` 使用 `localStorage` 存储所有数据。

*   **性能瓶颈**: `localStorage` 操作是同步的。每次读写都会阻塞主线程进行 JSON 序列化/反序列化。随着数据量增长（特别是图片和长文本），会导致页面卡顿。
*   **容量限制**: 浏览器通常限制为 5MB。无法满足长期存储用户创作内容（剧本、分镜）的需求。
*   **开发体验**: 需要手动管理 `useEffect` 中的加载状态和错误处理，容易产生竞态条件。

## 2. 目标架构

*   **存储层**: **IndexedDB** (通过 **Dexie.js** 封装)。
    *   支持异步非阻塞 I/O。
    *   几乎无限的存储容量（取决于硬盘空间）。
    *   支持索引查询，大幅提升检索速度。
*   **状态管理层**: **React Query (TanStack Query)**。
    *   自动缓存与后台更新。
    *   内置 Loading/Error 状态。
    *   请求去重。

## 3. 实施步骤

### 第一步：安装依赖

```bash
npm install dexie @tanstack/react-query
# 或者
pnpm add dexie @tanstack/react-query
```

### 第二步：创建数据库层 (src/lib/db.ts)

使用 Dexie 定义数据库 Schema。

```typescript
// src/lib/db.ts
import Dexie, { type Table } from 'dexie';
import type { User, Work, News, Link } from '@/types';

export class ComicDatabase extends Dexie {
  users!: Table<User>;
  works!: Table<Work>;
  news!: Table<News>;
  links!: Table<Link>;

  constructor() {
    super('AIComicDB');
    
    // 定义表结构和索引
    // 注意：只需定义需要被索引的字段，不需要定义所有字段
    this.version(1).stores({
      users: 'id, email',
      works: 'id, author_id, type, created_ms',
      news: 'id, created_ms',
      links: 'id, category'
    });
  }
}

export const db = new ComicDatabase();
```

### 第三步：配置 React Query (src/App.tsx)

在应用顶层注入 `QueryClientProvider`。

```typescript
// src/App.tsx 修改示例
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 数据 5 分钟内不过期
      gcTime: 1000 * 60 * 30,   // 垃圾回收时间 30 分钟
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* ...现有代码... */}
      </Router>
    </QueryClientProvider>
  );
};
```

### 第四步：创建数据 Hooks (src/hooks/useData.ts)

封装具体的业务逻辑，替代直接调用 API。

```typescript
// src/hooks/useWorks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import type { Work } from '@/types';

// 获取作品列表
export function useWorks(authorId?: string) {
  return useQuery({
    queryKey: ['works', authorId],
    queryFn: async () => {
      if (authorId) {
        return await db.works.where('author_id').equals(authorId).toArray();
      }
      return await db.works.toArray();
    }
  });
}

// 创建作品
export function useCreateWork() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newWork: Work) => {
      await db.works.add(newWork);
      return newWork;
    },
    onSuccess: () => {
      // 自动刷新列表
      queryClient.invalidateQueries({ queryKey: ['works'] });
    }
  });
}
```

### 第五步：逐步迁移

1.  选择一个页面（如 `Studio`）进行试点。
2.  用 `useWorks()` 替换 `tableApi.get('works')`。
3.  验证无误后，逐步推广到其他页面。
4.  最后移除 `src/lib/tableApi.ts`。

## 4. 立即可以做的微优化 (针对 tableApi.ts)

如果不立即进行架构迁移，可以对现有代码进行微调：

1.  **增加内存缓存**: 在 `TableApi` 类中增加 `private cache: Record<string, any[]>`，避免频繁读取 `localStorage`。只有在 `saveTable` 时才更新 `localStorage` 和缓存。
2.  **节流写入**: 对于高频写入操作（如自动保存），增加 `debounce` 机制。
