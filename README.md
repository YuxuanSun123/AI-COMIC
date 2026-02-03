# AI Comic - AI 漫画与视频创作平台

AI Comic 是一个功能强大的 AI 辅助创作工具，旨在帮助创作者通过人工智能技术快速生成剧本、分镜、角色设定以及最终的漫画或视频内容。本项目基于 React + Vite 构建，集成了多种主流大模型 API。

## 🌟 核心功能

### 1. 剧本生成 (Script Generator)
*   支持多种剧本风格（短视频、漫画、电影等）。
*   基于 LLM（大语言模型）自动生成包含场景、对白、画面的详细剧本。
*   支持流式输出，实时查看生成进度。

### 2. 分镜生成 (Storyboard Generator)
*   将剧本自动转换为可视化的分镜列表。
*   支持对每个分镜的画面描述进行微调。
*   为后续的绘图环节提供精确的构图参考。

### 3. 角色一致性 (Video Cards / Character Consistency)
*   **角色卡系统**：提取剧本中的角色特征，生成标准化的角色设定图。
*   **一致性保持**：在生成不同分镜时，引用角色卡以确保人物外貌的一致性。
*   支持自定义角色的外貌、性格和关系。

### 4. 漫画/视频编辑 (Editing / Comic Mode)
*   **漫画模式**：提供多种分格布局（四格、条漫等），自动填充生成的图像。
*   **图像生成**：集成 DALL-E 3、Flux、Google Imagen、阿里云通义万相 (Qwen-Image) 等多种绘图模型。
*   支持对单张图片进行重绘和修饰。

### 5. 多模型支持 (Multi-Provider AI)
*   **文本模型**：OpenAI (GPT-4o), Google (Gemini 1.5 Pro/Flash), 阿里云 (Qwen-Turbo/Max) 等。
*   **图像模型**：Flux.1, Stable Diffusion XL, DALL-E 3, 通义万相 (Qwen-Image) 等。
*   **灵活配置**：在后台管理页面 (Admin) 自由切换和配置不同的 API 提供商。

## 🛠️ 技术栈

*   **前端框架**: React 18, TypeScript
*   **构建工具**: Vite
*   **UI 组件库**: Radix UI, TailwindCSS, Shadcn/UI
*   **状态管理**: React Context / Hooks
*   **路由**: React Router
*   **国际化**: i18n (支持中英双语)

## 🚀 快速开始

### 环境要求
*   Node.js (建议 v18 或更高版本)
*   npm 或 yarn/pnpm

### 安装步骤

1.  **克隆项目**
    ```bash
    git clone https://github.com/YuxuanSun123/AI-COMIC.git
    cd AI-COMIC
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    启动后访问 `http://localhost:5173` (或终端显示的端口)。

## ⚙️ 配置指南

项目启动后，请点击右上角的 **设置 (Settings)** 图标或访问 `/admin` 页面进行配置：

1.  **API 密钥设置**：
    *   支持 OpenAI, Google Gemini, SiliconFlow (硅基流动), 阿里云 (DashScope) 等。
    *   输入相应的 API Key 并启用对应的提供商。
2.  **模型路由**：
    *   可以为不同的任务（如"剧本生成"、"图像生成"）指定不同的默认模型。
    *   例如：使用 DeepSeek 生成剧本，使用 Flux.1 生成图像。

## 📝 许可证

本项目采用 MIT 许可证。

---
*Created with ❤️ by AI Comic Team*
