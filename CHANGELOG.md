# 变更日志 (CHANGELOG)

本文档记录 AICM Workshop 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [2.3.0] - 2026-01-19

### 优化 (Improved)

#### 间距优化
- 表单项间距：从 16px 增加到 24px (+50%)
- 标签和输入框间距：从 4px 增加到 12px (+200%)
- 左侧卡片内边距：从 16px 增加到 24px (+50%)
- 中间卡片内边距：从 24px 增加到 32px (+33%)
- 右侧卡片内边距：从 16px 增加到 24px (+50%)
- 卡片间距（移动端）：从 16px 增加到 24px (+50%)
- 卡片间距（桌面端）：从 24px 增加到 32px (+33%)
- 容器上下边距：从 24px 增加到 32px (+33%)
- 滑块间距：从 24px 增加到 32px (+33%)

#### 输入框优化
- 背景色：从灰色（bg-input）改为白色（bg-background）
- 边框宽度：从 1px 增加到 2px
- 悬停效果：添加边框颜色变化（hover:border-primary/50）
- 焦点效果：添加边框高亮（focus:border-primary）
- 过渡动画：添加平滑颜色过渡（transition-colors）
- 输入框高度：从 40px 增加到 44px (+10%)
- 文本域禁止调整大小：添加 resize-none

#### 标签优化
- 字体加粗：添加 font-semibold
- 文字颜色：明确使用 text-foreground
- 下边距：增加到 12px（mb-3）
- 块级显示：添加 block
- 辅助文字：使用柔和颜色（text-muted-foreground）和正常字重（font-normal）

#### 按钮优化
- 生成按钮高度：从 40px 增加到 48px (+20%)
- 生成按钮样式：使用三色渐变（from-primary via-secondary to-accent）
- 生成按钮字号：增加到 text-base
- 生成按钮字重：添加 font-semibold
- 生成按钮阴影：添加 shadow-lg
- 保存按钮高度：从 40px 增加到 44px (+10%)
- 保存按钮字重：添加 font-semibold
- 按钮图标尺寸：从 16px 增加到 20px (+25%)
- 悬停效果：透明度变化（hover:opacity-90）

#### 文本域优化
- 故事提示行数：从 3行 增加到 4行 (+33%)
- 世界观行数：从 2行 增加到 3行 (+50%)
- 剧本输入行数：从 15行 增加到 16行 (+7%)

#### 滑块标签优化
- 标签布局：使用 flex 布局，标签和数值分开显示
- 标签字重：添加 font-semibold
- 标签下边距：增加到 16px（mb-4）
- 数值样式：使用主色（text-primary）和加粗（font-bold）
- 视觉层次：标签和数值清晰分离

#### 面板宽度优化
- 左侧面板：从 192px（xl:w-48）增加到 224px（xl:w-56）(+17%)
- 右侧面板：从 288px（xl:w-72）增加到 320px（xl:w-80）(+11%)

#### 全局样式优化
- 添加输入框焦点光晕效果：`box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1)`
- 添加渐变按钮样式类：`.gradient-button`
- 添加滑块悬停放大效果：`transform: scale(1.1)`

### 修复 (Fixed)

#### 用户体验问题
- 修复UI过于紧凑的问题，增加所有间距
- 修复输入框层次不清的问题，改用白色背景
- 修复标签不够突出的问题，添加加粗和间距
- 修复按钮单调的问题，使用渐变效果
- 修复缺乏呼吸感的问题，全面增加间距

#### 视觉问题
- 修复灰色背景导致层次不清的问题
- 修复边框过细不够清晰的问题
- 修复焦点效果不明显的问题
- 修复按钮高度不足的问题
- 修复数值显示不够突出的问题

### 变更 (Changed)

#### 设计理念
- 从"紧凑高效"转向"舒适美观"
- 从"功能优先"转向"体验优先"
- 增加呼吸感和视觉层次
- 提升专业感和品质感

---

## [2.2.0] - 2026-01-19

### 优化 (Improved)

#### 配色方案优化
- 从深色主题改为浅色主题，减少视觉疲劳
- 背景色：深紫色 `hsl(270 50% 5%)` → 浅灰白色 `hsl(0 0% 98%)`
- 前景色：浅色 `hsl(280 20% 95%)` → 深灰色 `hsl(240 10% 15%)`
- 卡片背景：深紫色 `hsl(270 40% 10%)` → 纯白色 `hsl(0 0% 100%)`
- 主色饱和度：霓虹紫 80% → 优雅紫 70%
- 次要色饱和度：霓虹蓝 85% → 柔和蓝 75%
- 强调色饱和度：霓虹粉 85% → 活力粉 75%
- 边框颜色：深色 `hsl(270 40% 20%)` → 浅灰 `hsl(240 6% 90%)`
- 阴影效果：霓虹光晕 → 柔和阴影

#### 布局优化
- 移除 ToolLayout 中的所有 ScrollArea 组件
- 从多滚动条（4个）改为单滚动条（1个）
- 使用 Flex 布局替代 Grid 布局
- 左侧面板：固定宽度 `xl:w-48`，内容自适应
- 中间面板：弹性宽度 `flex-1`，自然流动
- 右侧面板：固定宽度 `xl:w-72`，Sticky 定位 `xl:sticky xl:top-24`
- 右侧面板始终可见，无需独立滚动

#### 滚动条优化
- 自定义滚动条样式：宽度 8px，圆角设计
- 滚动条轨道：使用 `--muted` 颜色
- 滚动条滑块：使用 `--muted-foreground` 颜色，透明度 0.3
- 滚动条悬停：透明度提升到 0.5

#### 字体和动画优化
- 添加字体渲染优化：`-webkit-font-smoothing: antialiased`
- 添加平滑滚动：`scroll-behavior: smooth`
- 优化卡片悬停效果：位移距离从 4px 减少到 2px
- 使用缓动函数：`cubic-bezier(0.4, 0, 0.2, 1)`

### 修复 (Fixed)

#### 用户体验问题
- 修复深色背景长时间观看造成视觉疲劳的问题
- 修复填写页面多个滚动条导致观感不佳的问题
- 修复滚动交互混乱，用户不知道应该滚动哪个区域的问题
- 修复高饱和度霓虹色分散注意力的问题

#### 代码质量
- 清理 index.css 中的重复代码
- 移除不必要的 ScrollArea 依赖
- 简化布局组件结构

### 变更 (Changed)

#### 设计风格转变
- 从"科技炫酷风"转向"专业优雅风"
- 从"展示演示型"转向"长时间工作型"
- 保留霓虹渐变作为品牌特色（标题、按钮、强调色）
- 移除过度的发光效果

#### 适用场景
- 更适合专业创作者长时间使用
- 在各种环境下都舒适（明亮/暗淡）
- 提高可读性和专业感

---

## [2.1.0] - 2026-01-19

### 修复 (Fixed)

#### PRD文档修正
- 修正路由写法：统一为 `#/news` 格式（之前错误写成 `/news`）
- 清理所有 `\n` 和断裂的 Markdown/JSON 格式错误
- 修正 Mock 数据中的 JSON 格式错误（移除注释、修复括号）
- 修正 i18n 示例代码块格式错误

#### 权限逻辑修正
- 修正权限规则：未登录用户不可查看作品列表（之前错误允许）
- 修正权限判断字段：`current_user.id === work.author_id`（之前错误写成 `users.author_id === works.author_id`）
- 明确 Studio 页面需要登录才能访问
- 明确工具页可访问但保存需登录

### 新增 (Added)

#### 数据模型增强
- Work 表添加 `content_text` 字段（编辑器原文）
- Work 表添加 `content_json` 字段（结构化数据）
- 所有表的 `updated_ms` 字段规范化

#### 功能规范补充
- 新增草稿自动保存规范（每5秒保存到 `draft:{tool}:{workId|new}`）
- 新增离开页面未保存提醒规范
- 新增列表排序规则（默认 `updated_ms` 倒序）
- 新增删除确认弹窗统一规范
- 新增导出功能规范（TXT/JSON）
- 新增快捷示例规范（提升演示效果）

#### i18n 规范明确
- 明确 UI 文案语言：跟随全局 `app_lang`
- 明确生成器输出语言：工具页选择 > 全局 `app_lang`
- 明确 works.lang 写入规则：保存时的语言
- 补充语言持久化 key：`app_lang`

#### Studio 功能明确
- 补充打开作品跳转规则：根据 type 跳转到对应工具页
- 补充保存逻辑：无 id 则 POST，有 id 则 PATCH
- 补充 URL 参数传递：`#/tools/script?id={workId}`

#### API 预留章节（新增第11章）
- 新增数据访问层抽象说明
- 新增远端 API 返回结构规范
- 新增完整的 REST API Endpoint 清单
  - 认证接口：register, login, logout
  - 用户接口：me
  - 作品接口：CRUD + 查询
  - 新闻接口：CRUD + 查询
  - 友情链接接口：CRUD
- 新增 AI 生成接口预留
  - 生成剧本
  - 生成分镜
  - 生成镜头卡
  - 生成剪辑计划
- 新增 Token/鉴权预留说明

### 变更 (Changed)

#### 统一 API 响应结构
- 成功响应：`{ ok: true, data: T }`
- 失败响应：`{ ok: false, error: { code, message } }`
- 补充错误码：401（未登录）、403（无权限）、409（冲突）、422（校验失败）

#### 文档结构优化
- 将 API 预留内容从分散章节整合到第11章
- 补充完整的请求/响应示例
- 明确原型阶段和 Remote 模式的区别

---

## [2.0.0] - 2026-01-19

### 新增 (Added)

#### 数据访问层抽象
- 新增 `DataClient` 接口，定义统一的数据访问方法
- 新增 `LocalTableClient` 类，实现基于 localStorage 的数据存储
- 新增 `dataClient` 工厂函数，支持存储模式切换
- 新增 `ApiResponse<T>` 统一响应结构
- 新增 `ErrorCode` 枚举，定义标准错误码
- 新增 `QueryOptions` 接口，支持过滤、搜索、排序、分页

#### 查询功能增强
- `query()` 方法支持 `filter` 参数（按字段过滤）
- `query()` 方法支持 `search` 参数（全文搜索）
- `query()` 方法支持 `sort` 和 `order` 参数（排序）
- `query()` 方法支持 `limit` 和 `offset` 参数（分页）

#### 数据模型增强
- 所有表添加 `updated_ms` 字段
- `post()` 方法自动添加 `created_ms` 和 `updated_ms`
- `patch()` 方法自动更新 `updated_ms`
- 表名白名单验证（只允许 users/works/news/links）

#### 文档
- 新增 `PRD.md` - 完整的产品需求文档（50+ 页）
- 新增 `ARCHITECTURE.md` - 架构说明文档（30+ 页）
- 新增 `UPGRADE_SUMMARY.md` - v2.0 升级总结
- 新增 `QUICKSTART.md` - 快速开始指南
- 新增 `API.md` - API 接口文档（为后端开发提供参考）
- 新增 `CHANGELOG.md` - 变更日志

### 变更 (Changed)

#### 数据模型
- `User` 类型添加 `updated_ms: number` 字段
- `News` 类型添加 `updated_ms: number` 字段
- `Link` 类型添加 `updated_ms: number` 字段
- 所有 mock 数据添加 `updated_ms` 字段

#### 数据访问
- `mockData.ts` 中的 `initMockData()` 改为使用 `localTableClient`
- `AuthContext.tsx` 中的注册功能添加 `updated_ms` 字段
- `News.tsx` 中的创建功能添加 `updated_ms` 字段
- `Links.tsx` 中的创建功能添加 `updated_ms` 字段

#### 类型安全
- `localTableClient.ts` 中的类型断言优化
- 修复所有 TypeScript 类型错误

### 修复 (Fixed)
- 修复 `localTableClient.ts` 中的 `unknown` 类型错误
- 修复 `AuthContext.tsx` 中缺少 `updated_ms` 的错误
- 修复 `News.tsx` 和 `Links.tsx` 中缺少 `updated_ms` 的错误

### 技术债务 (Technical Debt)
- 保留旧的 `tableApi.ts` 以保持向后兼容（未来版本将移除）

---

## [1.0.0] - 2026-01-18

### 新增 (Added)

#### 核心功能
- 完整的 Hash Router 路由系统（14个页面）
- 演示级登录注册系统
- 中英文国际化支持
- 霓虹渐变科技风格 UI
- 响应式布局（桌面/平板/手机）

#### 页面组件
- 首页 (Home) - 工具入口展示
- 行业动态 (News) - 新闻列表和详情
- 创作工坊 (Studio) - 作品管理中心
- 剧本生成器 (ScriptGenerator) - 本地模拟生成
- 分镜生成器 (StoryboardGenerator) - 分镜脚本生成
- 镜头卡 (VideoCards) - 镜头卡片管理
- 剪辑合成 (Editing) - 剪辑计划制定
- 友情链接 (Links) - 链接管理
- 会员方案 (Pricing) - 会员等级展示
- 关于我们 (About) - 静态页面
- 联系我们 (Contact) - 静态页面
- 隐私政策 (Privacy) - 静态页面
- 使用条款 (Terms) - 静态页面
- 404页面 (NotFound)

#### 布局组件
- `MainLayout` - 主布局（顶部导航+面包屑+底部）
- `ToolLayout` - 工具页布局（三栏布局）

#### 认证组件
- `LoginDialog` - 登录对话框
- `RegisterDialog` - 注册对话框
- `AuthContext` - 认证状态管理

#### 通用组件
- `ToolCard` - 工具入口卡片
- `WorkCard` - 作品卡片
- `NewsCard` - 新闻卡片
- `LinkCard` - 友情链接卡片

#### 核心库
- `tableApi.ts` - localStorage CRUD 封装
- `i18n.ts` - 国际化配置（100+ 键）
- `mockData.ts` - 模拟数据
- `utils.ts` - 工具函数

#### 上下文
- `AuthContext` - 认证状态管理
- `LanguageContext` - 语言状态管理

#### 类型定义
- `types.ts` - 完整的数据模型定义
  - User, Work, News, Link
  - ScriptContent, StoryboardContent, VideoCardsContent, EditPlanContent
  - CurrentUser, TableName

#### 设计系统
- CSS 变量定义（霓虹渐变主题）
- Tailwind 配置（语义化颜色）
- 渐变文字工具类
- 发光效果工具类

#### 依赖
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- date-fns

### 技术特性
- 纯前端应用，无需后端
- localStorage 数据持久化
- Hash Router 单页应用
- 响应式设计
- 类型安全（TypeScript）
- 代码规范（ESLint + Biome）

---

## [未来计划]

### v2.1.0 (计划中)
- [ ] 搜索筛选 UI 组件
- [ ] 导出功能（TXT/JSON）
- [ ] 草稿自动保存
- [ ] 离开页面未保存提醒
- [ ] 完整的权限拦截中间件
- [ ] 邮箱唯一性验证增强
- [ ] 密码规则验证增强

### v3.0.0 (计划中)
- [ ] RemoteApiClient 实现
- [ ] 真实后端 API 集成
- [ ] JWT Token 认证
- [ ] 真实 AI 生成接口
- [ ] 团队协作功能
- [ ] 版本历史
- [ ] 评论系统

### v4.0.0 (计划中)
- [ ] 素材上传功能
- [ ] 图片/视频管理
- [ ] 实时协作编辑
- [ ] WebSocket 支持
- [ ] PDF/Word 导出
- [ ] 移动端 App

---

## 版本说明

### 版本号格式
`主版本号.次版本号.修订号`

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 变更类型
- **新增 (Added)**：新功能
- **变更 (Changed)**：现有功能的变更
- **弃用 (Deprecated)**：即将移除的功能
- **移除 (Removed)**：已移除的功能
- **修复 (Fixed)**：Bug 修复
- **安全 (Security)**：安全相关的修复

---

**维护者**：AICM Workshop Team  
**最后更新**：2026-01-19
