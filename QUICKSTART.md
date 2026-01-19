# AICM Workshop - 快速开始指南

## 🚀 5分钟快速上手

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

应用将在 `http://localhost:5173` 启动。

### 3. 使用演示账号登录

- **邮箱**：creator1@example.com
- **密码**：password

⚠️ **注意**：这是演示账号，密码存储不安全，请勿使用真实密码。

---

## 📖 核心功能

### 创作工坊 (Studio)
管理你的所有作品，包括剧本、分镜、镜头卡和剪辑计划。

**操作**：
- 查看作品列表
- 按类型筛选
- 打开编辑作品
- 删除作品

### 剧本生成器
创建漫剧剧本，支持多种题材。

**步骤**：
1. 选择题材类型（爱情/科幻/悬疑等）
2. 输入故事提示、角色、世界观
3. 调整参数（长度、节奏、温度）
4. 点击生成
5. 编辑生成的剧本
6. 保存到作品中心

### 分镜生成器
将剧本转换为分镜脚本。

**步骤**：
1. 输入剧本片段
2. 点击生成分镜
3. 查看生成的镜头列表
4. 增删排序镜头
5. 保存

### 镜头卡
创建详细的镜头卡片。

**字段**：
- 画面描述
- 动作
- 光影氛围
- 旁白台词
- AI Prompt

### 剪辑合成
制定剪辑计划。

**字段**：
- 镜头编号
- 素材需求
- 音效配音
- 转场效果
- 时长
- 备注

---

## 🌐 语言切换

点击右上角的语言按钮，可在中文和英文之间切换。

---

## 👤 用户系统

### 注册新账号

1. 点击右上角"注册"按钮
2. 填写邮箱、昵称、密码
3. 点击注册
4. 自动登录

### 会员等级

访问"会员方案"页面，可查看三个等级：
- **Free** - 免费版
- **Pro** - 专业版
- **Studio** - 工作室版

点击等级卡片可切换会员等级（演示功能）。

---

## 🎨 UI主题

### 霓虹渐变风格
- 深紫/黑色背景
- 紫蓝粉霓虹高光
- 发光效果
- 悬停动画

### 响应式设计
- 桌面：三栏布局
- 平板：两栏布局
- 手机：单栏布局

---

## 💾 数据存储

所有数据存储在浏览器的 localStorage 中：

- `users` - 用户数据
- `works` - 作品数据
- `news` - 新闻数据
- `links` - 友情链接数据
- `current_user` - 当前登录用户
- `app_lang` - 语言偏好

**清除数据**：
```javascript
// 在浏览器控制台执行
localStorage.clear();
location.reload();
```

---

## 🛠️ 开发命令

### 开发模式
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

### 预览构建结果
```bash
pnpm preview
```

### 代码检查
```bash
pnpm lint
```

---

## 📁 项目结构

```
src/
├── components/       # 组件
│   ├── auth/        # 认证组件
│   ├── common/      # 通用组件
│   ├── layouts/     # 布局组件
│   └── ui/          # UI组件
├── contexts/        # React Context
├── lib/             # 核心库
├── pages/           # 页面
├── types/           # 类型定义
├── App.tsx          # 应用入口
└── routes.tsx       # 路由配置
```

---

## 🔧 配置文件

### vite.config.ts
Vite 构建配置。

### tailwind.config.js
Tailwind CSS 配置，包含主题色。

### tsconfig.json
TypeScript 配置。

---

## 📚 文档

- **PRD.md** - 产品需求文档
- **ARCHITECTURE.md** - 架构说明文档
- **UPGRADE_SUMMARY.md** - v2.0升级总结
- **TODO.md** - 任务追踪

---

## 🐛 常见问题

### Q: 数据丢失了？
A: 数据存储在 localStorage，清除浏览器数据会导致丢失。

### Q: 如何重置数据？
A: 在浏览器控制台执行 `localStorage.clear()` 然后刷新页面。

### Q: 支持哪些浏览器？
A: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Q: 如何切换到远程API？
A: 参考 ARCHITECTURE.md 中的"扩展到远程API"章节。

### Q: 密码安全吗？
A: 不安全！这是演示项目，使用简单哈希。生产环境必须使用 bcrypt/argon2。

---

## 🚀 部署

### Vercel (推荐)

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 自动部署完成

### Netlify

1. 推送代码到 GitHub
2. 在 Netlify 导入项目
3. 构建命令：`pnpm build`
4. 发布目录：`dist`

### GitHub Pages

```bash
# 构建
pnpm build

# 部署到 gh-pages 分支
# 需要安装 gh-pages: pnpm add -D gh-pages
npx gh-pages -d dist
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 📧 联系方式

- 邮箱：contact@aicmworkshop.com
- 官网：www.aicmworkshop.com

---

**祝你使用愉快！** 🎉

如有问题，请查阅完整文档或联系我们。
