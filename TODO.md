# 任务：AI漫剧工作坊 AICM Workshop

## 计划
- [x] 步骤1：设计系统配置
  - [x] 更新 index.css 为霓虹渐变主题（深紫/黑色背景，紫蓝粉渐变）
- [x] 步骤2：核心基础设施
  - [x] 创建数据类型定义 types.ts
  - [x] 创建 localStorage 封装 tableApi.ts
  - [x] 创建国际化配置 i18n.ts
  - [x] 创建模拟数据 mockData.ts
  - [x] 创建语言上下文 LanguageContext.tsx
  - [x] 更新认证上下文 AuthContext.tsx
- [x] 步骤3：布局组件
  - [x] 创建主布局 MainLayout.tsx
  - [x] 创建工具页布局 ToolLayout.tsx
- [x] 步骤4：通用组件
  - [x] 创建登录对话框 LoginDialog.tsx
  - [x] 创建注册对话框 RegisterDialog.tsx
  - [x] 创建作品卡片 WorkCard.tsx
  - [x] 创建新闻卡片 NewsCard.tsx
  - [x] 创建链接卡片 LinkCard.tsx
  - [x] 创建工具卡片 ToolCard.tsx
- [x] 步骤5：页面组件
  - [x] 创建首页 Home.tsx
  - [x] 创建行业动态 News.tsx
  - [x] 创建新闻详情 NewsDetail.tsx
  - [x] 创建创作工坊 Studio.tsx
  - [x] 创建剧本生成器 ScriptGenerator.tsx
  - [x] 创建分镜生成器 StoryboardGenerator.tsx
  - [x] 创建镜头卡 VideoCards.tsx
  - [x] 创建剪辑合成 Editing.tsx
  - [x] 创建友情链接 Links.tsx
  - [x] 创建会员方案 Pricing.tsx
  - [x] 创建关于我们 About.tsx
  - [x] 创建联系我们 Contact.tsx
  - [x] 创建隐私政策 Privacy.tsx
  - [x] 创建使用条款 Terms.tsx
- [x] 步骤6：路由和入口
  - [x] 更新路由配置 routes.tsx
  - [x] 更新应用入口 App.tsx
- [x] 步骤7：验证
  - [x] 运行 lint 检查
- [x] 步骤8：架构升级（v2.0）
  - [x] 创建数据访问层抽象 (DataClient接口)
  - [x] 实现本地存储客户端 (LocalTableClient)
  - [x] 统一API响应结构 (ApiResponse)
  - [x] 定义错误码规范 (ErrorCode)
  - [x] 添加查询功能 (query方法支持过滤/搜索/排序/分页)
  - [x] 数据模型补强 (所有表添加updated_ms)
  - [x] 表名白名单验证
  - [x] 预留远程API接口
  - [x] 创建完整PRD文档

## 注意事项
- ✅ 纯前端应用，使用 Hash Router
- ✅ 所有数据存储在 localStorage
- ✅ 无真实 AI，本地模拟生成
- ✅ 支持中英文切换
- ✅ 霓虹渐变科技风格
- ✅ 演示登录功能（密码简单哈希，标注不安全）
- ✅ 会员等级切换演示
- ✅ 响应式设计（桌面优先，移动端适配）
- ✅ 数据访问层抽象，支持切换到远程API
- ✅ 统一API响应结构和错误处理
- ✅ 完整的PRD文档

## v2.0 架构改进
1. **数据访问层抽象**
   - DataClient 接口定义
   - LocalTableClient 实现（localStorage）
   - RemoteApiClient 预留（HTTP API）
   - 统一的 ApiResponse 结构

2. **数据模型增强**
   - 所有表添加 updated_ms 字段
   - 统一字段约束规范
   - 表名白名单验证

3. **查询功能增强**
   - 支持过滤 (filter)
   - 支持搜索 (search)
   - 支持排序 (sort/order)
   - 支持分页 (limit/offset)

4. **错误处理规范**
   - 统一错误码定义
   - 详细错误消息
   - 一致的错误响应结构

5. **API接口预留**
   - 完整的REST API端点定义
   - AI生成接口规范
   - 存储模式切换机制

## 待实现功能
- [ ] 搜索筛选UI组件
- [ ] 导出功能 (TXT/JSON)
- [ ] 草稿自动保存
- [ ] 离开页面未保存提醒
- [ ] RemoteApiClient 实现
- [ ] 完整的权限拦截中间件
- [ ] 邮箱唯一性验证增强
- [ ] 密码规则验证增强

## v2.1 PRD文档修正（2026-01-19）
- [x] 修正路由写法：统一为 #/news 格式
- [x] 清理所有 \n 和断裂的 Markdown/JSON
- [x] 修正权限规则：未登录不可查看作品列表
- [x] 修正权限判断字段：current_user.id === work.author_id
- [x] 统一 tableApi 返回结构：{ ok, data, error }
- [x] 补充数据模型字段：content_text, content_json
- [x] 明确 i18n 语言优先级规则
- [x] 补充 Studio 打开作品跳转规则
- [x] 新增草稿自动保存规范
- [x] 新增列表排序规则
- [x] 新增删除确认弹窗规范
- [x] 新增导出功能规范
- [x] 新增完整的 API 预留章节

## 完成状态
✅ 所有核心功能已完成并通过 lint 检查！
✅ v2.0 架构升级完成，支持未来扩展到远程API！
✅ v2.1 PRD文档修正完成，修复所有格式和逻辑错误！
