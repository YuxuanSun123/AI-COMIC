# AICM Workshop 架构说明文档

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                              │
│  (Pages & Components - React + TypeScript + shadcn/ui)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        状态管理层                              │
│         (React Context - Auth, Language, Theme)             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据访问抽象层                            │
│                    (DataClient Interface)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  统一API: get / post / patch / delete / query       │   │
│  │  统一响应: ApiResponse<T> { ok, data, error }       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   LocalTableClient       │  │   RemoteApiClient        │
│   (localStorage)         │  │   (HTTP API - 预留)      │
└──────────────────────────┘  └──────────────────────────┘
            ↓                             ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   Browser localStorage   │  │   Backend REST API       │
└──────────────────────────┘  └──────────────────────────┘
```

## 核心设计原则

### 1. 关注点分离 (Separation of Concerns)
- **UI层**：只负责展示和用户交互
- **状态层**：管理应用全局状态
- **数据层**：处理数据存取逻辑
- **存储层**：实际的数据持久化

### 2. 依赖倒置 (Dependency Inversion)
- 业务逻辑依赖抽象接口 (DataClient)
- 不依赖具体实现 (LocalTableClient)
- 可随时切换存储方式而不影响业务代码

### 3. 开闭原则 (Open-Closed Principle)
- 对扩展开放：可添加新的 DataClient 实现
- 对修改封闭：不需要修改现有业务代码

## 目录结构

```
src/
├── components/
│   ├── auth/              # 认证相关组件
│   │   ├── LoginDialog.tsx
│   │   └── RegisterDialog.tsx
│   ├── common/            # 通用组件
│   │   ├── NewsCard.tsx
│   │   ├── WorkCard.tsx
│   │   ├── LinkCard.tsx
│   │   └── ToolCard.tsx
│   ├── layouts/           # 布局组件
│   │   ├── MainLayout.tsx
│   │   └── ToolLayout.tsx
│   └── ui/                # shadcn/ui 基础组件
│
├── contexts/              # React Context
│   ├── AuthContext.tsx    # 认证状态
│   └── LanguageContext.tsx # 语言状态
│
├── lib/                   # 核心库
│   ├── dataClient.ts      # 数据客户端工厂
│   ├── dataClient.types.ts # 类型定义
│   ├── localTableClient.ts # 本地存储实现
│   ├── tableApi.ts        # 旧版API（向后兼容）
│   ├── i18n.ts            # 国际化配置
│   ├── mockData.ts        # 模拟数据
│   └── utils.ts           # 工具函数
│
├── pages/                 # 页面组件
│   ├── Home.tsx           # 首页
│   ├── News.tsx           # 新闻列表
│   ├── NewsDetail.tsx     # 新闻详情
│   ├── Studio.tsx         # 作品管理
│   ├── Links.tsx          # 友情链接
│   ├── Pricing.tsx        # 会员方案
│   ├── About.tsx          # 关于我们
│   ├── Contact.tsx        # 联系我们
│   ├── Privacy.tsx        # 隐私政策
│   ├── Terms.tsx          # 使用条款
│   └── tools/             # 工具页面
│       ├── ScriptGenerator.tsx
│       ├── StoryboardGenerator.tsx
│       ├── VideoCards.tsx
│       └── Editing.tsx
│
├── types/                 # TypeScript 类型
│   ├── types.ts           # 数据模型
│   └── index.ts           # 类型导出
│
├── App.tsx                # 应用入口
├── routes.tsx             # 路由配置
└── main.tsx               # React 挂载点
```

## 数据流

### 读取数据流程

```
1. 用户操作 (点击按钮)
   ↓
2. 组件调用 dataClient.get('works')
   ↓
3. DataClient 路由到 LocalTableClient
   ↓
4. LocalTableClient 从 localStorage 读取
   ↓
5. 返回 ApiResponse<Work[]>
   ↓
6. 组件更新 UI
```

### 写入数据流程

```
1. 用户提交表单
   ↓
2. 组件调用 dataClient.post('works', data)
   ↓
3. DataClient 路由到 LocalTableClient
   ↓
4. LocalTableClient 验证数据
   ↓
5. 生成 id, created_ms, updated_ms
   ↓
6. 写入 localStorage
   ↓
7. 返回 ApiResponse<Work>
   ↓
8. 组件更新 UI
```

## 数据访问层详解

### DataClient 接口

```typescript
interface DataClient {
  // 获取数据
  get<T>(table: string, id?: string): Promise<ApiResponse<T | T[]>>;
  
  // 创建数据
  post<T>(table: string, data: Partial<T>): Promise<ApiResponse<T>>;
  
  // 更新数据
  patch<T>(table: string, id: string, data: Partial<T>): Promise<ApiResponse<T>>;
  
  // 删除数据
  delete(table: string, id: string): Promise<ApiResponse<boolean>>;
  
  // 查询数据（支持过滤、搜索、排序、分页）
  query<T>(table: string, options?: QueryOptions): Promise<ApiResponse<T[]>>;
}
```

### 统一响应结构

```typescript
interface ApiResponse<T = unknown> {
  ok: boolean;           // 操作是否成功
  data?: T;              // 成功时返回的数据
  error?: {              // 失败时返回的错误信息
    code: number;        // 错误码
    message: string;     // 错误消息
  };
}
```

### 使用示例

```typescript
// 获取所有作品
const response = await dataClient.get<Work>('works');
if (response.ok) {
  const works = response.data as Work[];
  // 处理数据
} else {
  console.error(response.error?.message);
}

// 创建新作品
const response = await dataClient.post<Work>('works', {
  type: 'script',
  title: '我的剧本',
  content: { /* ... */ },
  author_id: currentUser.id,
  lang: 'zh'
});

// 查询作品（带过滤和排序）
const response = await dataClient.query<Work>('works', {
  filter: { author_id: currentUser.id, type: 'script' },
  sort: 'updated_ms',
  order: 'desc',
  limit: 10
});
```

## 状态管理

### AuthContext - 认证状态

```typescript
interface AuthContextType {
  currentUser: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: Error }>;
  register: (email: string, nickname: string, password: string) => Promise<{ error?: Error }>;
  logout: () => void;
  updateMembership: (tier: MembershipTier) => void;
}
```

### LanguageContext - 语言状态

```typescript
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}
```

## 路由系统

### Hash Router
使用 React Router 的 HashRouter，所有路由以 `#/` 开头。

**优势**：
- 无需服务器配置
- 支持静态部署
- 浏览器前进后退正常工作

**路由配置**：
```typescript
const routes: RouteConfig[] = [
  { path: '/', element: <Home />, title: 'home' },
  { path: '/news', element: <News />, title: 'news' },
  { path: '/studio', element: <Studio />, title: 'studio' },
  // ...
];
```

## 国际化系统

### 字典结构
```typescript
const translations = {
  zh: {
    appTitle: 'AI漫剧工作坊',
    login: '登录',
    // ...
  },
  en: {
    appTitle: 'AICM Workshop',
    login: 'Login',
    // ...
  }
};
```

### 使用方式
```typescript
const { t } = useLanguage();
<h1>{t('appTitle')}</h1>
```

## 主题系统

### CSS变量
```css
:root {
  --primary: 270 80% 60%;        /* 紫色 */
  --secondary: 240 70% 55%;      /* 蓝色 */
  --accent: 320 75% 65%;         /* 粉色 */
  --background: 240 10% 8%;      /* 深色背景 */
  --foreground: 0 0% 95%;        /* 浅色文字 */
}
```

### 渐变效果
```css
.gradient-text {
  background: linear-gradient(135deg, 
    hsl(var(--primary)), 
    hsl(var(--secondary))
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 性能优化

### 1. 代码分割
- 使用 React.lazy() 懒加载页面组件
- 路由级别的代码分割

### 2. 缓存策略
- localStorage 作为客户端缓存
- 避免重复读取

### 3. 虚拟化列表
- 长列表使用虚拟滚动
- 减少 DOM 节点数量

### 4. 防抖节流
- 搜索输入使用防抖
- 滚动事件使用节流

## 安全考虑

### 当前实现（演示级）
- ⚠️ 密码简单哈希，不安全
- ⚠️ 无CSRF保护
- ⚠️ 无XSS防护
- ⚠️ localStorage 可被访问

### 生产环境建议
- ✅ 使用 bcrypt 或 argon2 哈希密码
- ✅ 实现 CSRF Token
- ✅ 输入验证和转义
- ✅ 使用 HttpOnly Cookie 存储 Token
- ✅ 实现 Rate Limiting
- ✅ 添加 Content Security Policy

## 扩展到远程API

### 步骤1：实现 RemoteApiClient

```typescript
class RemoteApiClient implements DataClient {
  private baseURL: string;
  private token: string | null;

  async get<T>(table: string, id?: string): Promise<ApiResponse<T | T[]>> {
    const url = id ? `${this.baseURL}/${table}/${id}` : `${this.baseURL}/${table}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
  
  // 实现其他方法...
}
```

### 步骤2：配置环境变量

```env
VITE_STORAGE_MODE=remote
VITE_API_BASE_URL=https://api.aicmworkshop.com
```

### 步骤3：更新 dataClient.ts

```typescript
export function getDataClient(): DataClient {
  switch (STORAGE_MODE) {
    case 'local':
      return localTableClient;
    case 'remote':
      return new RemoteApiClient(API_BASE_URL);
    default:
      return localTableClient;
  }
}
```

### 步骤4：业务代码无需修改
所有使用 `dataClient` 的代码自动切换到远程API！

## 测试策略

### 单元测试
- 测试 DataClient 接口实现
- 测试工具函数
- 测试数据验证逻辑

### 集成测试
- 测试完整的数据流
- 测试认证流程
- 测试路由跳转

### E2E测试
- 测试用户注册登录
- 测试作品创建编辑
- 测试跨页面导航

## 部署方案

### 静态部署
```bash
# 构建
pnpm build

# 部署到任意静态服务器
# - GitHub Pages
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
```

### Docker部署
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 监控和日志

### 前端监控
- 使用 Sentry 捕获错误
- 使用 Google Analytics 追踪用户行为
- 使用 Web Vitals 监控性能

### 日志策略
```typescript
// 开发环境：console.log
// 生产环境：发送到日志服务
const logger = {
  info: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.log(message, data);
    } else {
      // 发送到日志服务
    }
  }
};
```

## 总结

AICM Workshop 采用了现代化的前端架构设计：

1. **清晰的分层架构**：UI、状态、数据、存储各司其职
2. **灵活的数据访问层**：支持本地和远程存储无缝切换
3. **统一的API规范**：一致的请求和响应结构
4. **完善的类型系统**：TypeScript 提供类型安全
5. **优雅的UI设计**：霓虹渐变科技风格
6. **国际化支持**：中英文双语
7. **响应式布局**：适配桌面和移动端

这个架构为未来的扩展打下了坚实的基础，可以轻松地：
- 切换到真实的后端API
- 添加新的功能模块
- 集成第三方服务
- 优化性能和安全性

---

**文档版本**：v1.0  
**最后更新**：2026-01-19  
**维护者**：AICM Workshop Team
