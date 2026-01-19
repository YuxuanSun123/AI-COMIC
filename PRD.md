# AI漫剧工作坊 AICM Workshop - 产品需求文档 (PRD)

## 版本信息
- 版本：v2.0
- 更新日期：2026-01-19
- 状态：已实现核心架构改进

## 1. 项目概述

### 1.1 项目定位
一款面向漫剧创作者的工具型网站，提供从剧本创作到剪辑计划的全流程辅助功能。

### 1.2 技术架构
- **前端框架**：React 18 + TypeScript + Vite
- **UI库**：shadcn/ui + Tailwind CSS
- **路由**：React Router (Hash Router)
- **状态管理**：React Context
- **数据存储**：localStorage (可切换到远程API)
- **国际化**：自定义i18n方案

### 1.3 核心特性
- 🎨 霓虹渐变科技风格UI
- 🌐 中英文双语支持
- 💾 本地数据持久化
- 🔧 全流程创作工具链
- 📱 响应式设计
- 🔐 演示级登录系统

---

## 2. 路由设计

### 2.1 Hash Router 规范
- **路由形式**：使用 Hash Router (`#/path`)
- **默认入口**：`#/` 渲染首页（Studio创作工坊）
- **404处理**：未知hash跳转到 `#/` 并提示"页面不存在"

### 2.2 路由表

| 路径 | 页面 | 说明 | 权限 |
|------|------|------|------|
| `#/` | Home | 首页/创作工坊 | 公开 |
| `#/news` | News | 行业动态列表 | 公开 |
| `#/news/:id` | NewsDetail | 新闻详情 | 公开 |
| `#/studio` | Studio | 作品管理中心 | 需登录 |
| `#/tools/script` | ScriptGenerator | 剧本生成器 | 需登录 |
| `#/tools/storyboard` | StoryboardGenerator | 分镜生成器 | 需登录 |
| `#/tools/video` | VideoCards | 镜头卡 | 需登录 |
| `#/tools/edit` | Editing | 剪辑合成 | 需登录 |
| `#/links` | Links | 友情链接 | 公开 |
| `#/pricing` | Pricing | 会员方案 | 公开 |
| `#/about` | About | 关于我们 | 公开 |
| `#/contact` | Contact | 联系我们 | 公开 |
| `#/privacy` | Privacy | 隐私政策 | 公开 |
| `#/terms` | Terms | 使用条款 | 公开 |

---

## 3. 数据模型

### 3.1 统一字段规范
所有表必须包含以下字段：
- `id`: string - 唯一标识 (格式: `{timestamp}_{random}`)
- `created_ms`: number - 创建时间戳
- `updated_ms`: number - 更新时间戳

### 3.2 User 用户表

```typescript
interface User {
  id: string;
  nickname: string;              // 昵称，最大长度50
  email: string;                 // 邮箱，唯一
  password_hash: string;         // 密码哈希（演示用途，不安全）
  membership_tier: 'free' | 'pro' | 'studio';  // 会员等级
  created_ms: number;
  updated_ms: number;
}
```

**约束**：
- email 必须唯一
- nickname 长度 1-50 字符
- password 最小长度 6 字符

### 3.3 Work 作品表

```typescript
type WorkType = 'script' | 'storyboard' | 'video_cards' | 'edit_plan';

interface Work {
  id: string;
  type: WorkType;
  title: string;                 // 标题，最大长度100
  content: ScriptContent | StoryboardContent | VideoCardsContent | EditPlanContent;
  author_id: string;             // 创建者ID
  lang: 'zh' | 'en';            // 语言
  created_ms: number;
  updated_ms: number;
}
```

**约束**：
- title 长度 1-100 字符
- author_id 必须存在于 users 表
- 删除规则：硬删除（原型阶段）

### 3.4 News 新闻表

```typescript
interface News {
  id: string;
  title: string;                 // 标题，最大长度200
  summary: string;               // 摘要，最大长度500
  content: string;               // 内容
  tags: string[];                // 标签，最多10个
  author_id: string;
  created_ms: number;
  updated_ms: number;
}
```

**约束**：
- title 长度 1-200 字符
- summary 长度 1-500 字符
- tags 最多 10 个，每个最大长度 20 字符

### 3.5 Link 友情链接表

```typescript
interface Link {
  id: string;
  name: string;                  // 名称，最大长度100
  url: string;                   // URL
  desc: string;                  // 描述，最大长度500
  tags: string[];                // 标签，最多5个
  author_id: string;
  created_ms: number;
  updated_ms: number;
}
```

**约束**：
- name 长度 1-100 字符
- url 必须是有效URL
- tags 最多 5 个

---

## 4. 数据访问层架构

### 4.1 架构设计

```
业务层 (Pages/Components)
    ↓
数据客户端接口 (DataClient)
    ↓
实现层 (LocalTableClient | RemoteApiClient)
    ↓
存储层 (localStorage | HTTP API)
```

### 4.2 DataClient 接口

```typescript
interface DataClient {
  get<T>(table: string, id?: string): Promise<ApiResponse<T | T[]>>;
  post<T>(table: string, data: Partial<T>): Promise<ApiResponse<T>>;
  patch<T>(table: string, id: string, data: Partial<T>): Promise<ApiResponse<T>>;
  delete(table: string, id: string): Promise<ApiResponse<boolean>>;
  query<T>(table: string, options?: QueryOptions): Promise<ApiResponse<T[]>>;
}
```

### 4.3 统一响应结构

```typescript
interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
  };
}
```

### 4.4 错误码定义

| 错误码 | 说明 | 场景 |
|--------|------|------|
| 400 | 请求参数错误 | 字段格式错误 |
| 401 | 未登录 | 需要登录的操作 |
| 403 | 无权限 | 不是作者 |
| 404 | 数据不存在 | 查询/更新/删除不存在的数据 |
| 409 | 冲突 | 邮箱重复 |
| 422 | 校验失败 | 字段验证失败 |
| 500 | 内部错误 | 系统错误 |

### 4.5 表名白名单
只允许访问以下表：
- `users`
- `works`
- `news`
- `links`

---

## 5. 权限与隐私逻辑

### 5.1 权限规则

#### 未登录状态
- ✅ 可查看：新闻列表/详情、友情链接、会员方案、静态页面
- ❌ 不可查看：作品列表/详情
- ❌ 不可操作：所有创建/编辑/删除操作

#### 已登录状态
- ✅ 可查看：自己创建的作品 (`author_id === current_user.id`)
- ✅ 可操作：自己创建的数据
- ❌ 不可操作：他人创建的数据

### 5.2 数据隔离规则

**Works 表**：
- 查询时自动过滤：只返回 `author_id === current_user.id` 的数据
- 编辑/删除时验证：必须是作者本人

**News/Links 表**：
- 查询：所有人可见
- 创建：需登录
- 编辑/删除：仅作者本人

### 5.3 权限提示
所有需要登录的操作统一提示：
- Toast消息："请先登录后使用该功能"
- 自动打开登录对话框

---

## 6. 认证系统

### 6.1 注册流程

**输入验证**：
- 邮箱：必须是有效邮箱格式
- 昵称：1-50 字符
- 密码：最小 6 字符，不允许空格

**注册逻辑**：
1. 检查邮箱唯一性，已存在返回 409
2. 密码简单哈希（演示用途）
3. 创建用户记录
4. 自动登录
5. 保存 `current_user` 到 localStorage

**安全声明**：
在注册/登录弹窗底部显示：
> ⚠️ 演示用途，密码存储不安全，请勿使用真实密码

### 6.2 登录流程

**输入验证**：
- 邮箱和密码必填

**登录逻辑**：
1. 查找用户
2. 验证密码哈希
3. 保存 `current_user` 到 localStorage

**current_user 结构**：
```typescript
interface CurrentUser {
  id: string;
  nickname: string;
  membership_tier: 'free' | 'pro' | 'studio';
  logged_in: boolean;
}
```

### 6.3 退出流程
1. 清除 `current_user` from localStorage
2. 刷新页面UI（按钮/权限状态）
3. 跳转到首页

---

## 7. 国际化 (i18n)

### 7.1 语言配置
- 支持语言：中文 (zh)、英文 (en)
- 默认语言：zh
- 持久化：localStorage key = `app_lang`

### 7.2 语言切换规则
- UI文案：跟随全局 `app_lang`
- 生成内容：跟随工具页选择的语言（优先级：工具选择 > app_lang）
- works.lang：保存时写入当次生成/编辑的语言

### 7.3 Key命名规范
使用驼峰命名：
- `appTitle`
- `scriptGenerator`
- `pleaseLogin`

---

## 8. 功能模块

### 8.1 Studio 作品管理中心

**功能**：
- 作品列表展示（按 updated_ms 倒序）
- 按类型筛选
- 按标题搜索
- 打开/编辑/删除作品

**打开作品逻辑**：
- 根据 work.type 跳转到对应工具页
- URL: `#/tools/{tool}?id={workId}`
- 工具页自动加载作品内容

### 8.2 剧本生成器

**输入**：
- 题材类型：爱情/科幻/悬疑/校园/家庭/惊悚
- 故事提示：textarea
- 角色：逗号分隔
- 世界观：textarea

**参数**：
- 长度：slider 0-100
- 节奏：slider 0-100
- 温度：slider 0-100

**生成逻辑**：
- 本地模拟生成（2秒延迟）
- 生成中禁用按钮
- 输出 JSON 格式的剧本结构

**保存逻辑**：
- 新建：POST /works
- 更新：PATCH /works/:id
- 自动更新 updated_ms

### 8.3 分镜生成器

**功能**：
- 输入剧本片段
- 生成镜头列表
- 增删排序
- 保存到作品

### 8.4 镜头卡

**功能**：
- 创建镜头卡列表
- 字段：画面描述、动作、光影氛围、旁白台词、Prompt
- 排序管理
- 保存到作品

### 8.5 剪辑合成

**功能**：
- 创建剪辑清单
- 字段：镜头编号、素材需求、音效配音、转场、时长、备注
- 排序管理
- 保存到作品

### 8.6 行业动态

**功能**：
- 新闻列表（按 created_ms 倒序）
- 按标签筛选
- 新闻详情页
- 登录后可创建/编辑/删除

### 8.7 友情链接

**功能**：
- 链接列表展示
- 登录后可创建/编辑/删除

### 8.8 会员方案

**功能**：
- 展示 Free/Pro/Studio 三个等级
- 点击切换会员等级（演示功能）
- 更新 user.membership_tier

---

## 9. UI/UX 规范

### 9.1 设计风格
- 主色调：深紫/黑色背景
- 强调色：霓虹渐变（紫、蓝、粉）
- 文字颜色：亮色系（白、浅灰、霓虹色）
- 卡片背景：深色系带轻微发光效果

### 9.2 响应式断点
- ≥1280px (xl)：三栏布局
- 768-1279px：两栏布局（右侧参数折叠为抽屉）
- <768px：单栏布局（参数面板变为底部 Drawer）

### 9.3 空状态
每个列表都要有空状态：
- 图标 + 文案
- 操作按钮（如"创建第一个作品"）

### 9.4 加载状态
- 按钮：显示 Loader 图标 + 禁用
- 列表：显示 Skeleton

### 9.5 错误提示
- Toast 消息
- 红色文字
- 简短描述

---

## 10. 预留API接口

### 10.1 存储模式切换

```typescript
type StorageMode = 'local' | 'remote';
```

- `local`：使用 LocalTableClient (localStorage)
- `remote`：使用 RemoteApiClient (HTTP API)

### 10.2 远端API基础约定

**Base URL**：
- 本地模式：空
- 远程模式：`https://your-domain.com/api`

**请求头**：
```
Content-Type: application/json
Authorization: Bearer {token}  // 远程模式
```

### 10.3 API Endpoint 清单

#### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 退出

#### 用户
- `GET /api/users/me` - 获取当前用户
- `PATCH /api/users/me` - 更新用户信息

#### 作品
- `GET /api/works?type=&q=&limit=&offset=` - 查询作品
- `GET /api/works/:id` - 获取作品详情
- `POST /api/works` - 创建作品
- `PATCH /api/works/:id` - 更新作品
- `DELETE /api/works/:id` - 删除作品

#### 新闻
- `GET /api/news?tag=&q=&limit=&offset=` - 查询新闻
- `GET /api/news/:id` - 获取新闻详情
- `POST /api/news` - 创建新闻
- `PATCH /api/news/:id` - 更新新闻
- `DELETE /api/news/:id` - 删除新闻

#### 友情链接
- `GET /api/links` - 获取链接列表
- `POST /api/links` - 创建链接
- `PATCH /api/links/:id` - 更新链接
- `DELETE /api/links/:id` - 删除链接

### 10.4 AI生成接口（预留）

```typescript
POST /api/ai/generate/script
POST /api/ai/generate/storyboard
POST /api/ai/generate/video_cards
POST /api/ai/generate/edit_plan

// 请求体
{
  "lang": "zh",
  "genre": "suspense",
  "inputs": {
    "prompt": "...",
    "roles": "...",
    "world": "..."
  },
  "params": {
    "length": "medium",
    "temperature": 0.7
  }
}

// 响应体
{
  "ok": true,
  "data": {
    "content_text": "...",
    "content_json": {}
  }
}
```

---

## 11. 实现状态

### 11.1 已完成 ✅
- [x] Hash Router 路由系统
- [x] 数据访问层抽象 (DataClient)
- [x] 本地存储客户端 (LocalTableClient)
- [x] 统一API响应结构
- [x] 数据模型补强 (updated_ms)
- [x] 权限逻辑基础
- [x] 认证系统
- [x] 国际化系统
- [x] 所有页面组件
- [x] 霓虹渐变UI主题
- [x] 响应式布局

### 11.2 待实现 🚧
- [ ] 搜索筛选功能
- [ ] 导出功能 (TXT/JSON)
- [ ] 草稿自动保存
- [ ] 离开页面未保存提醒
- [ ] 远程API客户端 (RemoteApiClient)
- [ ] 完整的权限拦截
- [ ] 邮箱唯一性验证增强
- [ ] 密码规则验证

### 11.3 未来规划 📋
- [ ] PDF/Word 导出
- [ ] 团队协作功能
- [ ] 真实AI生成接口
- [ ] 素材上传功能
- [ ] 版本历史
- [ ] 评论系统

---

## 12. 开发规范

### 12.1 代码规范
- TypeScript 严格模式
- ESLint + Biome 检查
- 2空格缩进
- 驼峰命名

### 12.2 提交规范
- feat: 新功能
- fix: 修复
- refactor: 重构
- docs: 文档
- style: 样式
- test: 测试

### 12.3 测试规范
- 单元测试：核心逻辑
- 集成测试：数据流
- E2E测试：关键流程

---

## 13. 部署说明

### 13.1 构建
```bash
pnpm build
```

### 13.2 部署
- 静态文件部署到任意静态服务器
- 支持 GitHub Pages / Vercel / Netlify
- 无需后端服务器

### 13.3 环境变量
```
VITE_STORAGE_MODE=local  # local | remote
VITE_API_BASE_URL=       # 远程API地址（可选）
```

---

## 附录

### A. 演示账号
- 邮箱：creator1@example.com
- 密码：password

### B. 浏览器支持
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### C. 性能指标
- 首屏加载：< 2s
- 交互响应：< 100ms
- 构建体积：< 500KB (gzip)

---

**文档版本**：v2.0  
**最后更新**：2026-01-19  
**维护者**：AICM Workshop Team
