# AI漫剧工作坊 AICM Workshop - 产品需求文档 (PRD)

## 版本信息
- 版本：v2.1
- 更新日期：2026-01-19
- 状态：已修正所有格式和逻辑错误

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
- **路由形式**：使用 Hash Router，所有路由以 `#/` 开头
- **默认入口**：`#/` 直接渲染首页（Home/Studio创作工坊）
- **404处理**：任何未知hash自动跳转到 `#/` 并显示Toast提示"页面不存在"

### 2.2 路由表

| 路径 | 页面 | 说明 | 权限 |
|------|------|------|------|
| `#/` | Home | 首页/创作工坊 | 公开 |
| `#/news` | News | 行业动态列表 | 公开 |
| `#/news/:id` | NewsDetail | 新闻详情 | 公开 |
| `#/studio` | Studio | 作品管理中心 | 需登录 |
| `#/tools/script` | ScriptGenerator | 剧本生成器 | 可访问，保存需登录 |
| `#/tools/storyboard` | StoryboardGenerator | 分镜生成器 | 可访问，保存需登录 |
| `#/tools/video` | VideoCards | 镜头卡 | 可访问，保存需登录 |
| `#/tools/edit` | Editing | 剪辑合成 | 可访问，保存需登录 |
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
  nickname: string;              // 昵称，1-50字符
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
- password 最小长度 6 字符，不允许空格

### 3.3 Work 作品表

```typescript
type WorkType = 'script' | 'storyboard' | 'video_cards' | 'edit_plan';

interface Work {
  id: string;
  type: WorkType;
  title: string;                 // 标题，1-100字符
  content_text: string;          // 编辑器原文
  content_json: object;          // 结构化数据
  author_id: string;             // 创建者ID
  lang: 'zh' | 'en';            // 语言
  created_ms: number;
  updated_ms: number;
}
```

**约束**：
- title 长度 1-100 字符
- author_id 必须存在于 users 表
- content_text 和 content_json 二选一或同时存在
- 删除规则：硬删除（原型阶段）

### 3.4 News 新闻表

```typescript
interface News {
  id: string;
  title: string;                 // 标题，1-200字符
  summary: string;               // 摘要，1-500字符
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
  name: string;                  // 名称，1-100字符
  url: string;                   // URL
  desc: string;                  // 描述，1-500字符
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

**关键原则**：
- 业务模块禁止直接访问 localStorage
- 只能通过 dataClient 访问数据
- 支持通过配置切换存储模式

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

**成功响应**：
```typescript
{
  ok: true,
  data: T  // 实际数据
}
```

**失败响应**：
```typescript
{
  ok: false,
  error: {
    code: number,
    message: string
  }
}
```

### 4.4 错误码定义

| 错误码 | 说明 | 场景 |
|--------|------|------|
| 400 | 请求参数错误 | 字段格式错误 |
| 401 | 未登录 | 需要登录的操作 |
| 403 | 无权限 | 不是作者，无权操作 |
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
**可访问页面**：
- ✅ 新闻列表/详情 (`#/news`, `#/news/:id`)
- ✅ 友情链接 (`#/links`)
- ✅ 会员方案 (`#/pricing`)
- ✅ 静态页面 (`#/about`, `#/contact`, `#/privacy`, `#/terms`)
- ✅ 工具页面 (`#/tools/*`) - 可进入和使用，但不可保存

**不可访问**：
- ❌ 作品管理中心 (`#/studio`) - 跳转到首页并提示"请先登录"

**不可操作**：
- ❌ 所有创建/编辑/删除操作
- ❌ 工具页的保存功能 - 点击保存时提示"请先登录"并打开登录对话框

#### 已登录状态
**可查看**：
- ✅ 自己创建的作品 (`current_user.id === work.author_id`)
- ✅ 所有新闻和链接

**可操作**：
- ✅ 创建新作品/新闻/新链接
- ✅ 编辑/删除自己创建的数据 (`current_user.id === item.author_id`)

**不可操作**：
- ❌ 编辑/删除他人创建的数据

### 5.2 数据隔离规则

**Works 表**：
- 查询时自动过滤：只返回 `current_user.id === work.author_id` 的数据
- 编辑/删除时验证：必须满足 `current_user.id === work.author_id`

**News 表**：
- 查询：所有人可见
- 创建：需登录
- 编辑/删除：必须满足 `current_user.id === news.author_id`

**Links 表**：
- 查询：所有人可见
- 创建：需登录
- 编辑/删除：必须满足 `current_user.id === link.author_id`

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
  last_login_ms: number;
}
```

### 6.3 退出流程
1. 清除 localStorage 中的 `current_user`
2. 刷新页面UI（按钮/权限状态）
3. 跳转到首页

---

## 7. 国际化 (i18n)

### 7.1 语言配置
- 支持语言：中文 (zh)、英文 (en)
- 默认语言：zh
- 持久化：localStorage key = `app_lang`

### 7.2 语言优先级规则

**UI文案语言**：
- 跟随全局 `app_lang`
- 包括：导航栏、按钮、提示信息、表单标签等

**生成器输出语言**：
- 优先级：工具页选择的 `lang` > 全局 `app_lang`
- 用户在工具页可以选择生成内容的语言
- 如果工具页未选择，则使用全局 `app_lang`

**works.lang 写入规则**：
- 保存时写入该作品最后一次保存时选择的语言
- 不是全局语言，而是该作品的语言

### 7.3 Key命名规范
使用驼峰命名：
- `appTitle`
- `scriptGenerator`
- `pleaseLogin`
- `saveSuccess`

### 7.4 字典示例

```typescript
const translations = {
  zh: {
    appTitle: 'AI漫剧工作坊',
    login: '登录',
    register: '注册',
    logout: '退出',
    language: '语言',
    chinese: '中文',
    english: '英文',
    news: '行业动态',
    studio: '创作工坊',
    scriptGenerator: '剧本生成器',
    storyboardGenerator: '分镜生成器',
    videoCards: '镜头卡',
    editing: '剪辑合成',
    links: '友情链接',
    pricing: '会员方案',
    about: '关于我们',
    contact: '联系我们',
    privacy: '隐私政策',
    terms: '使用条款',
    pleaseLogin: '请先登录',
    saveSuccess: '保存成功',
    deleteConfirm: '确定要删除吗？此操作不可逆'
  },
  en: {
    appTitle: 'AICM Workshop',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    language: 'Language',
    chinese: 'Chinese',
    english: 'English',
    news: 'Industry News',
    studio: 'Workshop',
    scriptGenerator: 'Script Generator',
    storyboardGenerator: 'Storyboard Generator',
    videoCards: 'Video Cards',
    editing: 'Editing',
    links: 'Friend Links',
    pricing: 'Pricing',
    about: 'About Us',
    contact: 'Contact Us',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    pleaseLogin: 'Please login first',
    saveSuccess: 'Saved successfully',
    deleteConfirm: 'Are you sure to delete? This action cannot be undone'
  }
};
```

---

## 8. 功能模块

### 8.1 Studio 作品管理中心

**功能**：
- 作品列表展示（按 updated_ms 倒序）
- 按类型筛选
- 按标题搜索
- 打开/编辑/删除作品

**打开作品逻辑**：
1. 用户点击作品标题
2. 根据 `work.type` 确定目标工具页：
   - `script` → `#/tools/script?id={workId}`
   - `storyboard` → `#/tools/storyboard?id={workId}`
   - `video_cards` → `#/tools/video?id={workId}`
   - `edit_plan` → `#/tools/edit?id={workId}`
3. 工具页加载时检查URL参数 `id`
4. 如果存在 `id`，调用 `dataClient.get('works', id)` 加载作品
5. 将作品内容填充到编辑器

**保存逻辑**：
- 无 `id`：调用 `dataClient.post('works', data)` 创建新作品
- 有 `id`：调用 `dataClient.patch('works', id, data)` 更新作品
- 自动更新 `updated_ms`

**删除确认**：
- 统一弹窗标题："删除确认"
- 统一提示文案："确定要删除该作品吗？此操作不可逆"
- 按钮：取消 / 确定删除

### 8.2 剧本生成器

**输入**：
- 题材类型：爱情/科幻/悬疑/校园/家庭/惊悚
- 语言选择：zh / en
- 故事提示：textarea
- 角色：逗号分隔
- 世界观：textarea

**参数**：
- 长度：slider 0-100
- 节奏：slider 0-100
- 温度：slider 0-100

**生成逻辑**：
- 本地模拟生成（2秒延迟）
- 生成中禁用按钮，显示loading
- 输出 JSON 格式的剧本结构

**快捷示例**（提升演示效果）：
- 示例1："一个关于时间旅行的悬疑故事"
- 示例2："校园青春爱情故事"
- 示例3："未来世界的科幻冒险"

**保存逻辑**：
- 新建：POST /works
- 更新：PATCH /works/:id
- 自动更新 updated_ms

**草稿自动保存**（建议实现）：
- 每 5 秒自动保存到 `draft:script:{workId|new}`
- 页面加载时检查是否有草稿
- 提示用户"发现未保存的草稿，是否恢复？"

**离开页面提醒**：
- 检测内容是否有变更
- 如果有变更且未保存，弹窗提示："是否保存草稿？"
- 按钮：不保存 / 保存草稿 / 取消

### 8.3 分镜生成器

**功能**：
- 输入剧本片段
- 生成镜头列表
- 增删排序
- 保存到作品

**生成逻辑**：
- 本地模拟生成（2秒延迟）
- 输出镜头列表（镜头号/画面/动作/机位/对白）

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
- 登录后可创建/编辑/删除（仅自己创建的）

**删除确认**：
- 统一弹窗和文案（同作品删除）

### 8.7 友情链接

**功能**：
- 链接列表展示
- 登录后可创建/编辑/删除（仅自己创建的）

**删除确认**：
- 统一弹窗和文案（同作品删除）

### 8.8 会员方案

**功能**：
- 展示 Free/Pro/Studio 三个等级
- 点击切换会员等级（演示功能）
- 更新 user.membership_tier

### 8.9 导出功能

**最小实现**：
- 导出 TXT：导出 `content_text` 字段
- 导出 JSON：导出完整的 work 对象

**未来扩展**：
- 导出 PDF
- 导出 Word

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

## 10. Mock 数据

### 10.1 Users

```json
[
  {
    "id": "u1",
    "nickname": "创作者1",
    "email": "creator1@example.com",
    "password_hash": "simplehash123",
    "membership_tier": "free",
    "created_ms": 1672531200000,
    "updated_ms": 1672531200000
  }
]
```

注意：password_hash 仅演示用途，不安全

### 10.2 News

```json
[
  {
    "id": "n1",
    "title": "漫剧行业新趋势",
    "summary": "探讨2026年漫剧行业发展新方向",
    "content": "本文分析了漫剧行业在技术、内容、商业模式等方面的新变化",
    "tags": ["行业趋势", "技术发展"],
    "author_id": "u1",
    "created_ms": 1672531200000,
    "updated_ms": 1672531200000
  },
  {
    "id": "n2",
    "title": "知名工作室推出新作",
    "summary": "XX工作室宣布启动新项目",
    "content": "工作室团队介绍及项目背景信息",
    "tags": ["工作室动态", "新项目"],
    "author_id": "u1",
    "created_ms": 1672617600000,
    "updated_ms": 1672617600000
  },
  {
    "id": "n3",
    "title": "融资消息",
    "summary": "YY公司获得新一轮融资",
    "content": "融资金额、投资方、资金用途等详情",
    "tags": ["融资", "资本动态"],
    "author_id": "u1",
    "created_ms": 1672704000000,
    "updated_ms": 1672704000000
  }
]
```

### 10.3 Links

```json
[
  {
    "id": "l1",
    "name": "动漫之家",
    "url": "https://www.dongmanhome.com",
    "desc": "综合性动漫资讯平台",
    "tags": ["资讯", "社区"],
    "author_id": "u1",
    "created_ms": 1672531200000,
    "updated_ms": 1672531200000
  },
  {
    "id": "l2",
    "name": "快看漫画",
    "url": "https://www.kuaikanmanhua.com",
    "desc": "热门漫画阅读平台",
    "tags": ["漫画", "阅读"],
    "author_id": "u1",
    "created_ms": 1672617600000,
    "updated_ms": 1672617600000
  },
  {
    "id": "l3",
    "name": "哔哩哔哩",
    "url": "https://www.bilibili.com",
    "desc": "视频分享平台，包含大量漫剧内容",
    "tags": ["视频", "漫剧"],
    "author_id": "u1",
    "created_ms": 1672704000000,
    "updated_ms": 1672704000000
  }
]
```

### 10.4 Works

```json
[
  {
    "id": "w1",
    "type": "script",
    "title": "示例剧本：校园爱情",
    "content_text": "第一话\n场景1：学校操场\n人物：女主角、男主角\n...",
    "content_json": {
      "acts": [
        {
          "act_number": 1,
          "scenes": [
            {
              "scene_number": 1,
              "location": "学校操场",
              "characters": ["女主角", "男主角"],
              "dialogues": [
                {
                  "speaker": "女主角",
                  "line": "喂，你又在发呆啊"
                },
                {
                  "speaker": "男主角",
                  "line": "啊，没事儿"
                }
              ],
              "actions": [
                "女主角走过来，轻拍男主角肩膀",
                "男主角回过神，露出微笑"
              ],
              "camera_suggestions": "中景镜头，展现两人互动"
            }
          ]
        }
      ]
    },
    "author_id": "u1",
    "lang": "zh",
    "created_ms": 1672531200000,
    "updated_ms": 1672531200000
  }
]
```

---

## 11. API 预留与可迁移架构

### 11.1 数据访问层抽象

**核心原则**：
- 业务模块禁止直接访问 localStorage
- 只能通过 dataClient 访问数据
- dataClient 有两种实现：LocalClient 和 RemoteClient

**配置切换**：
```typescript
// 环境变量
VITE_STORAGE_MODE=local  // local | remote
VITE_API_BASE_URL=       // 远程API地址（remote模式使用）
```

**实现层**：
- **LocalClient**：调用 tableApi，读写 localStorage（当前原型）
- **RemoteClient**：调用真实 HTTP API（未来实现）

### 11.2 远端 API 返回结构

**与 tableApi 保持完全一致**：

成功响应：
```json
{
  "ok": true,
  "data": { }
}
```

失败响应：
```json
{
  "ok": false,
  "error": {
    "code": 400,
    "message": "错误描述"
  }
}
```

### 11.3 REST API Endpoint 清单

#### 认证接口

**POST** `/api/auth/register`
- 请求体：`{ email, nickname, password }`
- 响应：`{ ok, data: { user, token } }`

**POST** `/api/auth/login`
- 请求体：`{ email, password }`
- 响应：`{ ok, data: { user, token } }`

**POST** `/api/auth/logout`
- 请求头：`Authorization: Bearer {token}`
- 响应：`{ ok, data: true }`

#### 用户接口

**GET** `/api/users/me`
- 请求头：`Authorization: Bearer {token}`
- 响应：`{ ok, data: User }`

**PATCH** `/api/users/me`
- 请求头：`Authorization: Bearer {token}`
- 请求体：`{ nickname?, membership_tier? }`
- 响应：`{ ok, data: User }`

#### 作品接口

**GET** `/api/works?type=&q=&limit=&offset=`
- 请求头：`Authorization: Bearer {token}`
- 查询参数：
  - `type`: 作品类型（可选）
  - `q`: 搜索关键词（可选）
  - `limit`: 每页数量（默认20）
  - `offset`: 偏移量（默认0）
- 响应：`{ ok, data: Work[] }`

**GET** `/api/works/:id`
- 请求头：`Authorization: Bearer {token}`
- 响应：`{ ok, data: Work }`

**POST** `/api/works`
- 请求头：`Authorization: Bearer {token}`
- 请求体：`{ type, title, content_text, content_json, lang }`
- 响应：`{ ok, data: Work }`

**PATCH** `/api/works/:id`
- 请求头：`Authorization: Bearer {token}`
- 请求体：`{ title?, content_text?, content_json? }`
- 响应：`{ ok, data: Work }`

**DELETE** `/api/works/:id`
- 请求头：`Authorization: Bearer {token}`
- 响应：`{ ok, data: true }`

#### 新闻接口

**GET** `/api/news?tag=&q=&limit=&offset=`
- 查询参数：
  - `tag`: 标签筛选（可选）
  - `q`: 搜索关键词（可选）
  - `limit`: 每页数量（默认20）
  - `offset`: 偏移量（默认0）
- 响应：`{ ok, data: News[] }`

**GET** `/api/news/:id`
- 响应：`{ ok, data: News }`

**POST** `/api/news`
- 请求头：`Authorization: Bearer {token}`
- 请求体：`{ title, summary, content, tags }`
- 响应：`{ ok, data: News }`

**PATCH** `/api/news/:id`
- 请求头：`Authorization: Bearer {token}`
- 请求体：`{ title?, summary?, content?, tags? }`
- 响应：`{ ok, data: News }`

**DELETE** `/api/news/:id`
- 请求头：`Authorization: Bearer {token}`
- 响应：`{ ok, data: true }`

#### 友情链接接口

**GET** `/api/links`
- 响应：`{ ok, data: Link[] }`

**POST** `/api/links`
- 请求头：`Authorization: Bearer {token}`
- 请求体：`{ name, url, desc, tags }`
- 响应：`{ ok, data: Link }`

**PATCH** `/api/links/:id`
- 请求头：`Authorization: Bearer {token}`
- 请求体：`{ name?, url?, desc?, tags? }`
- 响应：`{ ok, data: Link }`

**DELETE** `/api/links/:id`
- 请求头：`Authorization: Bearer {token}`
- 响应：`{ ok, data: true }`

### 11.4 AI 生成接口（预留）

#### 生成剧本

**POST** `/api/ai/generate/script`
- 请求头：`Authorization: Bearer {token}`
- 请求体：
```json
{
  "lang": "zh",
  "genre": "suspense",
  "inputs": {
    "prompt": "一个关于时间旅行的故事",
    "roles": "主角：李明，配角：张华",
    "world": "2050年的未来世界"
  },
  "params": {
    "length": 50,
    "pace": 70,
    "temperature": 0.7
  }
}
```
- 响应：
```json
{
  "ok": true,
  "data": {
    "content_text": "生成的剧本文本...",
    "content_json": {
      "acts": [ ]
    }
  }
}
```

#### 生成分镜

**POST** `/api/ai/generate/storyboard`
- 请求头：`Authorization: Bearer {token}`
- 请求体：
```json
{
  "lang": "zh",
  "inputs": {
    "script": "剧本片段..."
  },
  "params": {
    "shot_count": 10
  }
}
```
- 响应：
```json
{
  "ok": true,
  "data": {
    "content_json": {
      "shots": [ ]
    }
  }
}
```

#### 生成镜头卡

**POST** `/api/ai/generate/video_cards`
- 请求头：`Authorization: Bearer {token}`
- 请求体：
```json
{
  "lang": "zh",
  "inputs": {
    "storyboard": "分镜内容..."
  }
}
```
- 响应：
```json
{
  "ok": true,
  "data": {
    "content_json": {
      "cards": [ ]
    }
  }
}
```

#### 生成剪辑计划

**POST** `/api/ai/generate/edit_plan`
- 请求头：`Authorization: Bearer {token}`
- 请求体：
```json
{
  "lang": "zh",
  "inputs": {
    "video_cards": "镜头卡内容..."
  }
}
```
- 响应：
```json
{
  "ok": true,
  "data": {
    "content_json": {
      "clips": [ ]
    }
  }
}
```

### 11.5 Token/鉴权预留

**原型阶段**：
- 不启用 Token
- 使用 localStorage 存储 current_user

**Remote 模式**：
- 启用 JWT Token
- 请求头：`Authorization: Bearer {token}`
- Token 存储在 localStorage（key: `auth_token`）
- Token 过期自动跳转登录

---

## 12. 实现状态

### 12.1 已完成 ✅
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

### 12.2 待实现 🚧
- [ ] 搜索筛选UI组件
- [ ] 导出功能 (TXT/JSON)
- [ ] 草稿自动保存
- [ ] 离开页面未保存提醒
- [ ] 远程API客户端 (RemoteApiClient)
- [ ] 完整的权限拦截
- [ ] 邮箱唯一性验证增强
- [ ] 密码规则验证

### 12.3 未来规划 📋
- [ ] PDF/Word 导出
- [ ] 团队协作功能
- [ ] 真实AI生成接口
- [ ] 素材上传功能
- [ ] 版本历史
- [ ] 评论系统

---

## 13. 开发规范

### 13.1 代码规范
- TypeScript 严格模式
- ESLint + Biome 检查
- 2空格缩进
- 驼峰命名

### 13.2 提交规范
- feat: 新功能
- fix: 修复
- refactor: 重构
- docs: 文档
- style: 样式
- test: 测试

### 13.3 测试规范
- 单元测试：核心逻辑
- 集成测试：数据流
- E2E测试：关键流程

---

## 14. 部署说明

### 14.1 构建
```bash
pnpm build
```

### 14.2 部署
- 静态文件部署到任意静态服务器
- 支持 GitHub Pages / Vercel / Netlify
- 无需后端服务器

### 14.3 环境变量
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

**文档版本**：v2.1  
**最后更新**：2026-01-19  
**维护者**：AICM Workshop Team
