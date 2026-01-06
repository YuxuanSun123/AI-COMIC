# AI漫剧工作坊 AICM Workshop 需求文档

## 1. 项目概述

### 1.1 项目名称
AI漫剧工作坊 AICM Workshop

### 1.2 项目定位
一款面向漫剧创作者的工具型网站，提供从剧本创作到剪辑计划的全流程辅助功能，帮助创作者高效完成漫剧作品制作。\n
### 1.3 项目范围
纯前端静态网站原型，基于 Hash Router 实现单页应用（SPA），所有数据存储在浏览器 localStorage 中，用于演示和快速验证产品概念。\n
## 2. 页面结构与路由

### 2.1 路由路径
- `/` - 首页（Studio 创作工坊）\n- `/news` - 行业动态
- `/studio` - 创作工坊
- `/tools/script` - 剧本生成器
- `/tools/storyboard` - 分镜生成器
- `/tools/video` - 镜头卡
- `/tools/edit` - 剪辑合成
- `/links` - 友情链接
- `/pricing` - 会员方案
- `/about` - 关于我们
- `/contact` - 联系我们
- `/privacy` - 隐私政策
- `/terms` - 使用条款

### 2.2 全局布局
- 顶部导航栏：包含所有路由入口，右上角显示用户昵称、会员等级、语言切换按钮、登录/注册按钮（未登录时）或退出按钮（已登录时）\n- 面包屑/标题区：每个页面顶部显示当前页面标题和路径导航
- 主内容区：\n  - 工具页（/tools/*）采用三栏布局：左侧工具导航/类型选择、中间编辑/生成区域、右侧参数面板
  - 非工具页采用两栏或单栏布局

## 3. 功能模块

### 3.1 News 行业动态
- 列表页面：展示新闻卡片（标题、摘要、作者、发布时间）\n- 详情页面：完整新闻内容
- 登录后功能：新增、编辑、删除新闻（字段：title/summary/content/tags/author_id/created_ms）\n
### 3.2 Studio 创作工坊
- 工具入口卡片：展示所有工具类型（剧本生成器、分镜生成器、镜头卡、剪辑合成）\n- 我的作品列表：按类型筛选（script/storyboard/video_cards/edit_plan），显示作品标题、类型、创建时间
- 作品操作：打开、编辑、删除

### 3.3 Script Generator 剧本生成器
- 左侧：题材类型选择（爱情/科幻/悬疑/校园/家庭/惊悚等）、语言选择（zh/en）\n- 中间：输入区（故事提示/角色/世界观）、生成按钮、结果编辑器（textarea）\n- 右侧：参数面板（长度、节奏、温度等）\n- 生成逻辑：点击生成按钮后显示 loading，本地模拟生成器根据题材与输入拼接出标准漫画脚本结构（话数、场景、人物、旁白/台词、动作、分镜建议）\n- 支持一键保存到 works（type=script），并可从 works 重新载入继续编辑

### 3.4 Storyboard Generator 分镜生成器
- 输入区：输入剧本片段
- 生成按钮：本地模拟生成镜头分镜列表（镜头号/画面/动作/机位/对白）\n- 列表操作：增删排序
- 支持保存到 works（type=storyboard）\n
### 3.5 Video Generator 镜头卡
- 镜头卡列表：画面描述、动作、光影氛围、旁白台词、Prompt
- 列表操作：新增、删除、排序
- 支持保存到 works（type=video_cards）\n
### 3.6 Editing 剪辑合成
- 剪辑清单：镜头编号、素材需求、音效配音、转场、时长、备注
- 列表操作：新增、删除、排序
- 支持保存到 works（type=edit_plan）\n
### 3.7 Links 友情链接
- 列表展示（名称、网址、描述、标签）\n- 登录后功能：新增、编辑、删除（name/url/desc/tags/author_id）\n
### 3.8 Pricing 会员方案
- 展示 Free/Pro/Studio 三个会员等级卡片
- 点击等级卡片可把当前用户 membership_tier 修改为对应等级（仅演示效果）\n
### 3.9 About/Contact/Privacy/Terms
- 提供占位内容，排版美观

## 4. 数据模型

### 4.1 users 表
字段：\n- id: 用户唯一标识
- nickname: 用户昵称
- email: 注册邮箱
- password_hash: 密码哈希（演示用途，使用简单哈希或明文，标注不安全）\n- membership_tier: 会员等级（free/pro/studio）\n- created_ms: 注册时间戳

### 4.2 works 表
字段：\n- id: 作品唯一标识
- type: 作品类型（script/storyboard/video_cards/edit_plan）\n- title: 作品标题
- content: 作品内容（JSON 格式）\n- author_id: 创建者 id
- lang: 语言（zh/en）\n- created_ms: 创建时间戳
- updated_ms: 最后修改时间戳

### 4.3 news 表
字段：\n- id: 新闻唯一标识
- title: 新闻标题
- summary: 新闻摘要
- content: 新闻内容
- tags: 标签列表
- author_id: 创建者 id
- created_ms: 创建时间戳

### 4.4 links 表
字段：\n- id: 链接唯一标识
- name: 链接名称
- url: 链接地址
- desc: 链接描述
- tags: 标签列表
- author_id: 创建者 id
- created_ms: 创建时间戳

### 4.5 mock 数据示例

users:\n```json
[\n  {\n    \"id\": \"u1\",\n    \"nickname\": \"创作者1\",\n    \"email\": \"creator1@example.com\",\n    \"password_hash\": \"simplehash123\", // 演示用途，标注不安全
    \"membership_tier\": \"free\",\n    \"created_ms\": 1672531200000
  }\n]
```

```json
{\n  \"id\": \"n1\",\n  \"title\": \"漫剧行业新趋势\",\n  \"summary\": \"探讨2026年漫剧行业发展新方向\",\n  \"content\": \"本文分析了漫剧行业在技术、内容、商业模式等方面的新变化\",\n  \"tags\": [\"行业趋势\", \"技术发展\"],\n  \"author_id\": \"u1\",\n  \"created_ms\": 1672531200000
},\n{\n  \"id\": \"n2\",\n  \"title\": \"知名工作室推出新作\",\n  \"summary\": \"XX工作室宣布启动新项目\",\n  \"content\": \"工作室团队介绍及项目背景信息\",\n  \"tags\": [\"工作室动态\", \"新项目\"],\n  \"author_id\": \"u1\",\n  \"created_ms\": 1672617600000
},\n{\n  \"id\": \"n3\",\n  \"title\": \"融资消息\",\n  \"summary\": \"YY公司获得新一轮融资\",\n  \"content\": \"融资金额、投资方、资金用途等详情\",\n  \"tags\": [\"融资\", \"资本动态\"],\n  \"author_id\": \"u1\",\n  \"created_ms\": 1672704000000
}\n]\n
links:\n```json
[\n  {\n    \"id\": \"l1\",\n    \"name\": \"动漫之家\",\n    \"url\": \"https://www.dongmanhome.com\",\n    \"desc\": \"综合性动漫资讯平台\",\n    \"tags\": [\"资讯\", \"社区\"],\n    \"author_id\": \"u1\",\n    \"created_ms\": 1672531200000
},\n{\n    \"id\": \"l2\",\n    \"name\": \"快看漫画\",\n    \"url\": \"https://www.kuaikanmanhua.com\",\n    \"desc\": \"热门漫画阅读平台\",\n    \"tags\": [\"漫画\", \"阅读\"],\n    \"author_id\": \"u1\",\n    \"created_ms\": 1672617600000
},\n{\n    \"id\": \"l3\",\n    \"name\": \"哔哩哔哩\",\n    \"url\": \"https://www.bilibili.com\",\n    \"desc\": \"视频分享平台，包含大量漫剧内容\",\n    \"tags\": [\"视频\", \"漫剧\"],\n    \"author_id\": \"u1\",\n    \"created_ms\": 1672704000000
}\n]\n
works:\n```json
[\n  {\n    \"id\": \"w1\",\n    \"type\": \"script\",\n    \"title\": \"示例剧本：校园爱情\",\n    \"content\": {\n      \"acts\": [\n        {\n          \"act_number\": 1,\n          \"scenes\": [\n            {\n              \"scene_number\": 1,\n              \"location\": \"学校操场\",\n              \"characters\": [\"女主角\", \"男主角\"],\n              \"dialogues\": [\n                {\n                  \"speaker\": \"女主角\",\n                  \"line\": \"喂，你又在发呆啊\"\n                },\n                {\n                  \"speaker\": \"男主角\",\n                  \"line\": \"啊，没事儿， just thinking\"\n                }\n              ],\n              \"actions\": [\n                \"女主角走过来，轻拍男主角肩膀\",\n                \"男主角回过神，露出微笑\"\n              ],\n              \"camera_suggestions\": \"中景镜头，展现两人互动\"\n            }\n          ]\n        }\n      ]\n    },\n    \"author_id\": \"u1\",\n    \"lang\": \"zh\",\n    \"created_ms\": 1672531200000
  }\n]\n
## 5. 本地持久化方案

### 5.1 localStorage 表结构
- `users`：存储用户数据
- `works`：存储作品数据
- `news`：存储新闻数据
- `links`：存储友情链接数据
- `current_user`：存储当前登录用户信息（id、nickname、membership_tier、logged_in）\n
### 5.2 RESTful Table API 行为定义
封装成 `tableApi` 对象，路径形式为 `tables/{table}`，支持以下方法：\n
- `get(table, id?)`\n  - 如果不传 id，返回指定表的所有数据数组
  - 如果传了 id，返回指定表中对应 id 的单条数据对象
  - 如果数据不存在，返回 null

- `post(table, data)`\n  - 向指定表插入一条数据，自动分配 id
  - 成功返回新生成的数据对象
  - 失败返回错误码和错误信息

- `patch(table, id, data)`\n  - 更新指定表中对应 id 的数据
  - 成功返回更新后的数据对象
  - 失败返回错误码和错误信息

- `delete(table, id)`\n  - 删除指定表中对应 id 的数据
  - 成功返回 true
  - 失败返回错误码和错误信息

### 5.3 错误码与返回结构
- 成功：返回数据对象或布尔值
- 失败：返回对象 `{ code: 错误码, message: 错误信息 }`\n- 常见错误码：\n  - 404: 数据不存在
  - 400: 请求参数错误
  - 500: 内部错误

## 6. 演示登录功能

### 6.1 注册
- 输入邮箱、昵称、密码
- 校验邮箱格式、密码长度
- 注册成功后自动登录，数据保存到 users 表
- 在 localStorage 中保存当前用户信息到 `current_user`\n
### 6.2 登录
- 输入邮箱、密码
- 校验密码（简单哈希或明文对比）\n- 登录成功后在 localStorage 中保存当前用户信息到 `current_user`\n
### 6.3 退出
- 清除 localStorage 中的 `current_user`\n- 返回未登录状态

### 6.4 登录态保持
- 页面加载时检查 localStorage 中的 `current_user`\n- 如果存在则保持登录态
- 如果不存在则视为未登录

### 6.5 密码哈希说明
- 演示用途，使用简单哈希或明文存储
- 在代码注释中明确标注「仅演示用途，不安全」\n
## 7. 中英文 i18n 方案

### 7.1 字典结构
- `i18n` 对象：包含 zh 和 en 两个语言版本
- 每个语言版本包含所有 UI 文案键值对
- 示例：\n```json
{\n  \"zh\": {\n    \"title\": \"AI漫剧工作坊\",\n    \"login\": \"登录\",\n    \"register\": \"注册\",\n    \"logout\": \"退出\",\n    \"language\": \"语言\",\n    \"chinese\": \"中文\",\n    \"english\": \"英文\",\n    \"news\": \"行业动态\",\n    \"studio\": \"创作工坊\",\n    \"script_generator\": \"剧本生成器\",\n    \"storyboard_generator\": \"分镜生成器\",\n    \"video_cards\": \"镜头卡\",\n    \"editing\": \"剪辑合成\",\n    \"links\": \"友情链接\",\n    \"pricing\": \"会员方案\",\n    \"about\": \"关于我们\",\n    \"contact\": \"联系我们\",\n    \"privacy\": \"隐私政策\",\n    \"terms\": \"使用条款\",\n    \"...\": \"其他文案键值对\"\n  },\n  \"en\": {\n    \"title\": \"AICM Workshop\",\n    \"login\": \"Login\",\n    \"register\": \"Register\",\n    \"logout\": \"Logout\",\n    \"language\": \"Language\",\n    \"chinese\": \"Chinese\",\n    \"english\": \"English\",\n    \"news\": \"Industry News\",\n    \"studio\": \"Workshop\",\n    \"script_generator\": \"Script Generator\",\n    \"storyboard_generator\": \"Storyboard Generator\",\n    \"video_cards\": \"Video Cards\",\n    \"editing\": \"Editing\",\n    \"links\": \"Friend Links\",\n    \"pricing\": \"Pricing\",\n    \"about\": \"About Us\",\n    \"contact\": \"Contact Us\",\n    \"privacy\": \"Privacy Policy\",\n    \"terms\": \"Terms of Service\",\n    \"...\": \"其他文案键值对\"\n  }\n}
```

```json
{\n  \"7.2 语言切换策略
- 点击语言切换按钮时，更新全局语言变量
- 重新渲染所有 UI 文案
- 保存当前语言偏好到 localStorage
- 作品生成内容（works.content）需根据当前语言自动生成对应语言版本

7.3 works.lang 写入规则
- 新增作品时，默认写入当前全局语言变量值（zh/en）\n- 编辑作品时，可切换语言并更新 lang 字段
- 生成器默认输出语言与当前全局语言一致

## 8. 权限与拦截规则

8.1 未登录时
- 隐藏所有编辑、新增、删除按钮
- 显示「请登录」提示
- 仅可查看公开内容（作品列表、新闻列表、友情链接列表）\n
8.2 已登录时
- 显示编辑、新增、删除按钮
- 可操作自己创建的数据（users.author_id === works.author_id）\n- 会员等级影响部分功能解锁（如 Pro 级别可使用高级工具）\n
## 9. 交互流程

9.1 注册登录流程
1. 用户点击注册按钮
2. 填写邮箱、昵称、密码
3. 点击注册提交
4. 系统校验信息后注册成功
5. 自动登录，页面显示用户昵称和会员等级

9.2 生成剧本流程
1. 用户进入剧本生成器页面
2. 选择题材类型和语言
3. 填写故事提示、角色、世界观信息
4. 点击生成按钮，显示 loading
5. 系统本地模拟生成剧本内容
6. 生成完成后显示在编辑器中
7. 用户可编辑剧本内容
8. 点击保存按钮，将剧本保存到作品中心（type=script）\n
9.3 在 Studio 打开继续编辑流程
1. 用户在创作工坊页面查看作品列表
2. 点击某剧本作品标题
3. 系统读取 works 表中对应 id 的数据
4. 自动跳转到剧本生成器页面并加载作品内容
5. 用户可继续编辑
6. 保存后更新作品数据

9.4 删除作品流程
1. 用户在创作工坊页面查看作品列表
2. 点击某作品右侧的删除按钮
3. 系统弹出确认框「确定要删除该作品吗？此操作不可逆」\n4. 用户确认后，调用 tableApi.delete 删除数据
5. 删除成功后刷新作品列表

9.5 升级会员流程
1. 用户进入会员方案页面
2. 查看 Free/Pro/Studio 三个等级介绍
3. 点击某个等级卡片
4. 系统将当前用户 membership_tier 更新为对应等级
5. 页面提示「会员升级成功」\n6. 会员等级图标更新

## 10. UI 风格规范

10.1 配色方案
- 主色调：深紫/黑色背景
- 色彩强调：霓虹渐变高光（紫、蓝、粉渐变）\n- 文字颜色：亮色系（白、浅灰、霓虹色）确保可读性
- 卡片背景：深色系带轻微发光效果

10.2 字体规范
- 主字体：现代无衬线字体，确保屏幕阅读舒适
- 标题字体：稍重的字重，增强视觉层次
- 字号层级：标题 > 次标题 > 正文 > 辅助文字

10.3 按钮动效
- 鼠标悬停：轻微放大效果，霓虹光晕扩散
- 点击状态：短暂按压效果，光晕收缩
- 激活状态：持续发光效果，区分于普通状态

10.4 卡片阴影
- 柔和圆角设计
- 微光效果阴影，营造悬浮感
- 工具页卡片带有渐变光晕

10.5 表单规范
- 输入框带有淡色边框
- 焦点状态边框变亮并带有霓虹色强调
- 必填字段标记明显
- 提交按钮采用醒目配色

10.6 错误提示规范
- 错误信息采用红色文字
- 附带简短描述帮助用户快速修正
- 错误提示框带有轻微震动动画

## 11. 边界与限制声明

11.1 无真实鉴权
- 密码存储为演示用途，不安全
- 无验证码机制
- 无真实用户验证

11.2 无真实 AI
- 所有生成器为本地模拟实现
- 脚本、分镜、镜头卡等内容由系统规则生成
- 无外部 API 调用

11.3 无支付功能
- 会员升级为演示切换效果
- 无真实交易流程

11.4 无素材上传
- 镜头卡、剪辑计划仅支持文本描述
- 无图片、视频上传功能

## 12. 验收标准

### 12.1 公共模块
- 顶部导航栏在所有页面正确显示
- 面包屑/标题区在所有页面正确显示
- 语言切换功能正常
- 登录态保持和退出功能正常
- 响应式布局在移动端适配良好

### 12.2 News 模块
- 新闻列表展示正确，包含标题、摘要、作者、时间
- 新闻详情页面显示完整内容
- 登录后可新增、编辑、删除新闻
- 数据持久化正常

### 12.3 Studio 模块
- 工具入口卡片展示正确
- 作品列表按类型筛选功能正常
- 作品标题、类型、时间显示正确
- 打开、编辑、删除功能正常

### 12.4 Script Generator 模块
- 题材类型和语言选择功能正常
- 生成按钮触发后显示 loading
- 生成内容结构正确（话数、场景、人物、台词、动作、分镜建议）\n- 编辑器可正常编辑内容
- 保存功能将数据持久化到 works 表
- 从 works 载入内容可正常编辑

### 12.5 Storyboard Generator 模块
- 输入剧本片段后可生成镜头分镜列表
- 列表包含镜头号、画面、动作、机位、对白
- 增删排序功能正常
- 保存功能将数据持久化到 works 表

### 12.6 Video Generator 模块
- 镜头卡列表展示正确
- 列表包含画面描述、动作、光影氛围、旁白台词、Prompt
- 增删排序功能正常
- 保存功能将数据持久化到 works 表

### 12.7 Editing 模块
- 剪辑清单展示正确
- 列表包含镜头编号、素材需求、音效配音、转场、时长、备注
- 增删排序功能正常
- 保存功能将数据持久化到 works 表

### 12.8 Links 模块
- 友情链接列表展示正确
- 登录后可新增、编辑、删除链接
- 数据持久化正常

### 12.9 Pricing 模块
- 三个会员等级卡片展示正确
- 点击等级卡片可切换会员等级
- 会员等级图标更新正确

### 12.10 About/Contact/Privacy/Terms 模块
- 页面内容完整
- 排版美观，符合整体风格

## 13. 技术实现说明

13.1 Hash Router 实现
- 使用原生 History API 的 hashchange 事件监听路由变化
- 页面加载时根据 hash 值渲染对应内容
- 点击导航按钮时更新 hash 值
- 支持浏览器前进后退按钮

13.2 localStorage 封装
- `tableApi` 对象统一管理数据读写
- 数据以 JSON 字符串形式存储
- 支持表级和记录级操作
- 自动处理数据转换

13.3 i18n 实现
- 全局语言变量控制文案切换
- 每个组件通过语言变量动态获取文案
- 作品生成内容根据语言变量生成对应版本

13.4 模块化组织
- router：路由管理模块
- store：数据存储模块
- tableApi：表级 API 封装
- auth：认证授权模块
- views/components：页面和组件模块
- utils：工具函数模块

13.5 响应式实现
- 使用 CSS 媒体查询适配不同屏幕尺寸
- 工具页三栏布局在移动端自动变为单栏
- 字体大小和间距根据屏幕尺寸调整

## 14. 文件结构

- index.html：入口文件，包含基本结构和资源引用
- css/style.css：样式表，包含全局样式和组件样式
- js/app.js：应用主文件，包含所有模块和功能逻辑