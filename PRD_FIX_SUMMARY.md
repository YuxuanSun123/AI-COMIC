# PRD v2.1 修正总结

## 修正日期
2026-01-19

## 修正原因
根据用户反馈，PRD v2.0 存在多个必须修正的问题和建议补充的内容。

---

## 一、必须修正的问题（已全部修复）

### 1. 路由写法不一致 ✅

**问题**：
- 文档中写的是 `/news`、`/studio` 等
- 实际应该是 `#/news`、`#/studio`（Hash Router）

**修正**：
- 统一所有路由为 `#/` 开头
- 明确 `#/` 直接渲染首页（Studio）
- 补充未知路由跳转规则：跳转到 `#/` 并提示"页面不存在"

### 2. 文档格式错误 ✅

**问题**：
- 大量 `\n` 作为文本残留
- Mock 数据中 JSON 包含注释（JSON 不允许注释）
- news 示例不是合法 JSON（缺少数组包裹）
- links/works 的代码块未正确闭合
- i18n 示例后面出现错误代码块

**修正**：
- 清理所有 `\n` 残留
- 移除 JSON 中的注释
- 修正所有 Mock 数据为合法 JSON
- 修正所有代码块格式
- 重新组织 i18n 章节结构

### 3. 权限规则错误 ✅

**问题**：
- 文档写"未登录可查看作品列表"
- 这会导致隐私泄露

**修正**：
- 未登录：只可查看 News、Links、Pricing、About/Contact/Privacy/Terms
- Studio：必须登录才能访问
- Tools：可进入，但不可保存，保存时提示登录
- Works：必须登录才显示，且只显示 `current_user.id === work.author_id` 的作品

### 4. 权限判断字段错误 ✅

**问题**：
- 文档写 `users.author_id === works.author_id`
- users 表没有 author_id 字段

**修正**：
- 统一为 `current_user.id === work.author_id`
- 同理：`current_user.id === news.author_id`
- 同理：`current_user.id === link.author_id`

### 5. tableApi 返回结构不统一 ✅

**问题**：
- 成功返回数据/布尔，失败返回 `{code, message}`
- 实现层会很乱

**修正**：
- 统一成功响应：`{ ok: true, data: T }`
- 统一失败响应：`{ ok: false, error: { code, message } }`
- 补充错误码：401（未登录）、403（非作者）、409（冲突）、422（校验失败）

### 6. 数据模型缺少字段 ✅

**问题**：
- works 只有 content: JSON
- 但编辑器是 textarea，后续会混乱

**修正**：
- 添加 `content_text: string`（编辑器原文）
- 添加 `content_json: object`（结构化内容）
- 二选一或同时存在
- 所有表统一添加 `updated_ms` 字段

### 7. i18n 规则不明确 ✅

**问题**：
- 没有明确语言优先级
- 实现时会争论

**修正**：
- UI 文案语言：全局 `app_lang`
- 生成器输出语言：工具页选择 `lang` > 全局 `app_lang`
- works.lang：保存时的语言
- 补充语言持久化 key：`app_lang`

### 8. Studio 跳转规则不明确 ✅

**问题**：
- 没有写明如何从 Studio 打开作品

**修正**：
- 点击作品 → 根据 type 跳转到对应工具页
- URL 格式：`#/tools/script?id={workId}`
- 工具页加载时检查 URL 参数 `id`
- 保存逻辑：无 id 则 POST，有 id 则 PATCH

---

## 二、建议补充的内容（已全部补充）

### 1. 草稿自动保存 ✅

**补充内容**：
- 每 5 秒自动保存到 `draft:{tool}:{workId|new}`
- 页面加载时检查是否有草稿
- 提示用户"发现未保存的草稿，是否恢复？"

### 2. 列表排序规则 ✅

**补充内容**：
- 默认按 `updated_ms` 倒序
- 作品列表、新闻列表统一规则

### 3. 删除确认弹窗 ✅

**补充内容**：
- 统一弹窗标题："删除确认"
- 统一提示文案："确定要删除该作品吗？此操作不可逆"
- 按钮：取消 / 确定删除

### 4. 导出功能 ✅

**补充内容**：
- 最小实现：
  - 导出 TXT：导出 `content_text` 字段
  - 导出 JSON：导出完整的 work 对象
- 未来扩展：PDF、Word

### 5. 离开页面提醒 ✅

**补充内容**：
- 检测内容是否有变更
- 如果有变更且未保存，弹窗提示："是否保存草稿？"
- 按钮：不保存 / 保存草稿 / 取消

### 6. 快捷示例 ✅

**补充内容**：
- 示例1："一个关于时间旅行的悬疑故事"
- 示例2："校园青春爱情故事"
- 示例3："未来世界的科幻冒险"

---

## 三、API 预留章节（新增第11章）

### 11.1 数据访问层抽象 ✅

**补充内容**：
- 业务模块禁止直接访问 localStorage
- 只能通过 dataClient 访问数据
- dataClient 两种实现：LocalClient 和 RemoteClient
- 通过配置切换：`storage_mode = local | remote`

### 11.2 远端 API 返回结构 ✅

**补充内容**：
- 与 tableApi 保持完全一致
- 成功：`{ ok: true, data }`
- 失败：`{ ok: false, error: { code, message } }`

### 11.3 REST API Endpoint 清单 ✅

**补充内容**：
- 认证接口：
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/logout
- 用户接口：
  - GET /api/users/me
  - PATCH /api/users/me
- 作品接口：
  - GET /api/works?type=&q=&limit=&offset=
  - GET /api/works/:id
  - POST /api/works
  - PATCH /api/works/:id
  - DELETE /api/works/:id
- 新闻接口：
  - GET /api/news?tag=&q=&limit=&offset=
  - GET /api/news/:id
  - POST /api/news
  - PATCH /api/news/:id
  - DELETE /api/news/:id
- 友情链接接口：
  - GET /api/links
  - POST /api/links
  - PATCH /api/links/:id
  - DELETE /api/links/:id

### 11.4 AI 生成接口（预留） ✅

**补充内容**：
- POST /api/ai/generate/script
- POST /api/ai/generate/storyboard
- POST /api/ai/generate/video_cards
- POST /api/ai/generate/edit_plan
- 统一请求体字段：`lang`, `genre`, `inputs`, `params`
- 统一响应：`content_text` + `content_json`

### 11.5 Token/鉴权预留 ✅

**补充内容**：
- 原型阶段：不启用 Token
- Remote 模式：启用 JWT Token
- 请求头：`Authorization: Bearer {token}`
- Token 存储在 localStorage（key: `auth_token`）

---

## 四、修正前后对比

### 路由写法

| 修正前 | 修正后 |
|--------|--------|
| `/news` | `#/news` |
| `/studio` | `#/studio` |
| `/tools/script` | `#/tools/script` |

### 权限规则

| 场景 | 修正前 | 修正后 |
|------|--------|--------|
| 未登录访问 Studio | 可访问 | 跳转首页并提示登录 |
| 未登录查看作品列表 | 可查看 | 不可查看 |
| 未登录使用工具页 | 未明确 | 可使用但不可保存 |

### 权限判断

| 修正前 | 修正后 |
|--------|--------|
| `users.author_id === works.author_id` | `current_user.id === work.author_id` |

### API 响应结构

| 场景 | 修正前 | 修正后 |
|------|--------|--------|
| 成功 | 直接返回数据 | `{ ok: true, data }` |
| 失败 | `{ code, message }` | `{ ok: false, error: { code, message } }` |

### 数据模型

| 表 | 修正前 | 修正后 |
|----|--------|--------|
| Work | `content: object` | `content_text: string` + `content_json: object` |
| News | 无 `updated_ms` | 有 `updated_ms` |
| Link | 无 `updated_ms` | 有 `updated_ms` |

---

## 五、文档质量提升

### 格式规范
- ✅ 所有 JSON 代码块格式正确
- ✅ 所有 Markdown 格式正确
- ✅ 无残留的 `\n` 字符
- ✅ 代码块正确闭合

### 内容完整性
- ✅ 所有章节结构清晰
- ✅ 所有规则明确无歧义
- ✅ 所有示例代码可用
- ✅ 所有接口定义完整

### 可读性
- ✅ 章节层次分明
- ✅ 表格清晰易读
- ✅ 代码示例规范
- ✅ 注释说明充分

---

## 六、验收标准

### 格式验收 ✅
- [x] 所有路由以 `#/` 开头
- [x] 所有 JSON 格式正确
- [x] 所有 Markdown 格式正确
- [x] 无格式错误

### 逻辑验收 ✅
- [x] 权限规则正确
- [x] 权限判断字段正确
- [x] API 响应结构统一
- [x] 数据模型完整

### 完整性验收 ✅
- [x] 补充草稿自动保存
- [x] 补充列表排序规则
- [x] 补充删除确认规范
- [x] 补充导出功能规范
- [x] 补充 API 预留章节

---

## 七、影响范围

### 需要同步修改的代码
1. **路由配置**：
   - routes.tsx 中的路由路径（已正确实现）
   
2. **权限逻辑**：
   - Studio 页面添加登录检查
   - 工具页保存按钮添加登录检查
   - 作品列表添加 author_id 过滤

3. **数据模型**：
   - Work 类型添加 content_text 和 content_json 字段
   - 生成器保存时同时写入两个字段

4. **API 响应**：
   - 已在 v2.0 实现统一响应结构
   - 无需修改

### 不需要修改的代码
1. **UI 组件**：无需修改
2. **样式系统**：无需修改
3. **国际化配置**：无需修改
4. **数据访问层**：已在 v2.0 实现，无需修改

---

## 八、后续行动

### 立即执行
- [x] 更新 PRD.md 到 v2.1
- [x] 更新 TODO.md 记录修正
- [x] 更新 CHANGELOG.md 记录变更
- [x] 创建修正总结文档

### 近期执行（建议）
- [ ] 根据新 PRD 调整代码实现
- [ ] 添加 Studio 登录检查
- [ ] 添加工具页保存登录检查
- [ ] 实现草稿自动保存
- [ ] 实现导出功能

### 未来执行
- [ ] 实现 RemoteApiClient
- [ ] 开发后端 API
- [ ] 集成真实 AI

---

## 九、总结

### 修正成果
- ✅ 修正 8 个必须修正的问题
- ✅ 补充 6 个建议补充的内容
- ✅ 新增完整的 API 预留章节
- ✅ 提升文档质量和可读性

### 文档质量
- **修正前**：存在格式错误、逻辑错误、内容不完整
- **修正后**：格式规范、逻辑正确、内容完整

### 可用性
- **修正前**：实现时会产生歧义和争论
- **修正后**：规则明确，可直接按文档实现

---

**修正版本**：v2.1  
**修正日期**：2026-01-19  
**修正人员**：AICM Workshop Team  
**审核状态**：✅ 已完成
