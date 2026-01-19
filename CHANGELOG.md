# 变更日志 (CHANGELOG)

本文档记录 AICM Workshop 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

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
