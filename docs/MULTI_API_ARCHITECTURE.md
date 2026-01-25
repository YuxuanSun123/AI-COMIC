# 多API接入架构文档

## 概述

AICM Workshop v2.9.0 引入了完整的多API接入架构，支持同时配置和使用多个AI服务提供商（Providers），并为每个功能点灵活配置路由规则。

## 核心设计思路

### A) Providers：统一管理多个服务商

每个Provider记录一套完整的连接信息，并标注它属于哪类能力：

- **LLM 文本生成**：剧本/分镜/镜头卡/剪辑计划
  - 例：OpenAI / DeepSeek / Azure OpenAI / 本地LLM
- **Image 文生图**：分镜图、镜头卡概念图
  - 例：Nano Banana Pro / SD WebUI / Replicate / 自建文生图服务
- **TTS 配音**（可选）：旁白/台词配音
- **ASR 转写**（可选）：录音转文字做脚本整理

### B) Routing：每个功能点选择"用哪个Provider + 哪个模型"

为每个功能点配置独立的路由规则：

- **剧本生成** → 选择LLM Provider + 模型 + 参数预设
- **分镜生成** → 选择LLM Provider + 模型（可与剧本不同）
- **镜头卡生成** → 选择LLM Provider（可用更便宜的模型）
- **剪辑计划生成** → 选择LLM Provider（偏结构化输出）
- **文生图（分镜图/镜头概念图）** → 选择Image Provider + 模型

支持特性：
- **优先级/Fallback**：主Provider失败自动切换备用Provider
- **参数模板**：不同任务不同温度/最大字数/输出格式的预设

## 数据结构

### 1. ApiProvider（服务提供商）

```typescript
interface ApiProvider {
  id: string;                // 唯一标识
  name: string;              // 自定义名称，如 "OpenAI-主用"
  type: ProviderType;        // 类型：llm/image/tts/asr
  enabled: boolean;          // 是否启用
  base_url: string;          // API Base URL
  api_key: string;           // API Key
  default_model: string;     // 默认模型名
  headers_json?: string;     // 自定义Headers（JSON字符串）
  created_ms: number;        // 创建时间
  updated_ms: number;        // 更新时间
}
```

**存储位置**：`localStorage.api_providers`（数组）

### 2. ApiRouting（功能路由配置）

```typescript
interface ApiRouting {
  script: FunctionRouting;          // 剧本生成
  storyboard: FunctionRouting;      // 分镜生成
  video_cards: FunctionRouting;     // 镜头卡生成
  edit_plan: FunctionRouting;       // 剪辑计划生成
  image_storyboard: FunctionRouting; // 分镜图生成
  image_shot: FunctionRouting;      // 镜头图生成
}

interface FunctionRouting {
  enabled: boolean;              // 是否启用
  provider_id: string;           // Provider ID
  model: string;                 // 模型名
  output_format: OutputFormat;   // 输出格式：json/md
  params: RoutingParams;         // 参数
  fallback_provider_id?: string; // 备用Provider ID（可选）
}

interface RoutingParams {
  temperature: number;   // 温度（0-1）
  max_tokens: number;    // 最大token数
  top_p: number;         // Top P（0-1）
}
```

**存储位置**：`localStorage.api_routing`（对象）

## 后台管理界面

### Tab A：Providers管理

**功能**：
- 列表展示所有Providers（卡片样式）
- 支持新增/编辑/删除/复制Provider
- 每个Provider显示：名称、类型、Base URL、API Key（密文）、默认模型
- 启用/禁用开关
- 测试连接按钮：显示延迟/成功/失败信息
- API Key显示/隐藏切换

**编辑项**：
- Provider名称（自定义，如 "OpenAI-主用"）
- 类型：LLM / IMAGE / TTS / ASR
- Base URL
- API Key（密文输入）
- 默认模型
- 自定义Headers（JSON格式，可选）

### Tab B：功能路由

**功能**：
- 为每个功能点配置路由规则
- 6个功能点：剧本生成、分镜生成、镜头卡生成、剪辑计划生成、分镜图生成、镜头图生成
- 每个功能点包含：
  - 启用开关
  - Provider下拉（按type过滤）
  - Model输入/下拉
  - 输出格式选择（JSON/Markdown）
  - Fallback Provider选择
  - 高级参数（可折叠）：Temperature / Max Tokens / Top P

**Provider过滤**：
- LLM功能（剧本/分镜/镜头卡/剪辑）：只显示type=llm的Provider
- Image功能（分镜图/镜头图）：只显示type=image的Provider

## 统一生成接口

### aiClient.generate(taskType, payload)

**功能**：
- 根据任务类型和路由配置，自动选择Provider和模型
- 支持Fallback机制：主Provider失败时自动尝试备用Provider
- 未配置或未启用时，自动回退到原有的本地模拟生成器

**调用流程**：
1. 读取`api_routing`配置，获取任务的路由规则
2. 检查是否启用，未启用则回退到本地模拟生成器
3. 读取`api_providers`配置，找到对应的Provider
4. 调用Provider的API，发送生成请求
5. 如果失败且配置了Fallback，尝试备用Provider
6. 返回生成结果或错误信息

**示例**：
```typescript
// 剧本生成
const result = await aiClient.generate('script', {
  user: { id: '...', nickname: '...', membership_tier: 'pro' },
  lang: 'zh',
  genre: '科幻',
  input: { logline: '...', world: '...', characters: [...] },
  params: { length_level: 'mid', pace: 'mid', temperature: 0.7, style_tag: '' },
  meta: { client: 'web', version: '2.9.0' }
});

// 分镜图生成
const imageResult = await aiClient.generate('image_storyboard', {
  prompt: '一个未来城市的全景，高楼林立，飞行汽车穿梭',
  style: 'cyberpunk',
  aspect_ratio: '16:9'
});
```

### aiClient.testProvider(provider)

**功能**：
- 测试Provider连接是否正常
- 返回延迟、成功/失败状态、错误信息

**测试方法**：
- LLM Provider：发送简单的chat请求（"Hello"，max_tokens=10）
- Image Provider：发送简单的图片生成请求（"test"，256x256）

**返回结果**：
```typescript
interface ProviderTestResult {
  success: boolean;   // 是否成功
  latency?: number;   // 延迟（毫秒）
  error?: string;     // 错误信息
  message?: string;   // 成功消息
}
```

## 前台工具页面集成

### 当前状态
- ✅ 统一生成接口已实现（aiClient.generate）
- ✅ Fallback机制已实现
- ✅ 回退到本地模拟生成器已实现
- ⏳ 四个工具页面（剧本/分镜/镜头卡/剪辑）待更新使用新接口
- ⏳ 文生图功能UI待实现

### 待实现功能

#### 1. 更新工具页面
将四个工具页面的生成调用改为：
```typescript
// 旧方法
const result = await aiClient.generateScript(payload);

// 新方法
const result = await aiClient.generate('script', payload);
```

#### 2. 文生图功能
在分镜和镜头卡页面添加"生成概念图"按钮：
- 位置：每个分镜/镜头卡的操作区域
- 功能：调用`aiClient.generate('image_storyboard', {...})`或`aiClient.generate('image_shot', {...})`
- 显示：图片预览占位，加载状态，错误提示

## 使用场景示例

### 场景1：多Provider配置

**配置**：
- Provider 1：OpenAI-主用（type=llm，model=gpt-4）
- Provider 2：DeepSeek-便宜（type=llm，model=deepseek-chat）
- Provider 3：NanoBanana-图（type=image，model=nano-banana-pro）

**路由配置**：
- 剧本生成：使用OpenAI-主用，Fallback到DeepSeek-便宜
- 分镜生成：使用DeepSeek-便宜（节省成本）
- 镜头卡生成：使用DeepSeek-便宜
- 剪辑计划生成：使用OpenAI-主用（需要更好的结构化输出）
- 分镜图生成：使用NanoBanana-图
- 镜头图生成：使用NanoBanana-图

### 场景2：Fallback机制

**配置**：
- 主Provider：OpenAI-主用
- Fallback Provider：DeepSeek-便宜

**工作流程**：
1. 用户点击"生成剧本"
2. 系统调用OpenAI-主用
3. OpenAI-主用失败（网络错误/API限流）
4. 系统自动切换到DeepSeek-便宜
5. DeepSeek-便宜成功返回结果
6. 用户看到生成的剧本，无感知切换

### 场景3：本地开发

**配置**：
- 所有功能路由都未启用（enabled=false）

**工作流程**：
1. 用户点击"生成剧本"
2. 系统检测到路由未启用
3. 自动回退到本地模拟生成器
4. 返回模拟数据
5. 用户可以正常测试功能，无需真实API

## 技术实现细节

### 1. Provider调用

**LLM Provider**：
```typescript
// 构建OpenAI格式请求
const requestBody = {
  model: model || provider.default_model,
  messages: [
    { role: 'system', content: '你是一个专业的AI漫剧创作助手。' },
    { role: 'user', content: JSON.stringify(payload) }
  ],
  temperature: 0.7,
  max_tokens: 4000
};

// 发送请求
const response = await fetch(`${provider.base_url}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${provider.api_key}`,
    ...customHeaders
  },
  body: JSON.stringify(requestBody)
});
```

**Image Provider**：
```typescript
// 构建文生图请求
const requestBody = {
  prompt: JSON.stringify(payload),
  model: model || provider.default_model,
  n: 1,
  size: '1024x1024'
};

// 发送请求
const response = await fetch(`${provider.base_url}/images/generations`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${provider.api_key}`,
    ...customHeaders
  },
  body: JSON.stringify(requestBody)
});
```

### 2. 错误处理

**网络错误**：
```typescript
try {
  const result = await callProvider(provider, taskType, model, payload);
  return result;
} catch (error) {
  // 尝试Fallback
  if (fallbackProviderId) {
    const fallbackProvider = providers.find(p => p.id === fallbackProviderId);
    if (fallbackProvider) {
      return await callProvider(fallbackProvider, taskType, model, payload);
    }
  }
  throw error;
}
```

**API错误**：
```typescript
if (!response.ok) {
  throw new Error(`Provider请求失败: ${response.status} ${response.statusText}`);
}
```

### 3. 响应解析

**LLM响应**：
```typescript
const content = result.choices?.[0]?.message?.content;
try {
  const data = JSON.parse(content);
  return { ok: true, data };
} catch (e) {
  // 如果不是JSON，直接返回文本
  return { ok: true, data: { text: content } };
}
```

**Image响应**：
```typescript
const imageUrl = result.data?.[0]?.url;
if (!imageUrl) {
  throw new Error('Provider响应格式错误');
}
return { ok: true, data: { image_url: imageUrl } };
```

## 配置示例

### OpenAI Provider
```json
{
  "id": "provider_1234567890",
  "name": "OpenAI-主用",
  "type": "llm",
  "enabled": true,
  "base_url": "https://api.openai.com/v1",
  "api_key": "sk-...",
  "default_model": "gpt-4",
  "created_ms": 1706083200000,
  "updated_ms": 1706083200000
}
```

### DeepSeek Provider
```json
{
  "id": "provider_1234567891",
  "name": "DeepSeek-便宜",
  "type": "llm",
  "enabled": true,
  "base_url": "https://api.deepseek.com/v1",
  "api_key": "sk-...",
  "default_model": "deepseek-chat",
  "created_ms": 1706083200000,
  "updated_ms": 1706083200000
}
```

### Nano Banana Pro Provider
```json
{
  "id": "provider_1234567892",
  "name": "NanoBanana-图",
  "type": "image",
  "enabled": true,
  "base_url": "https://api.nanobanana.pro/v1",
  "api_key": "nb-...",
  "default_model": "nano-banana-pro",
  "headers_json": "{\"X-Custom-Header\": \"value\"}",
  "created_ms": 1706083200000,
  "updated_ms": 1706083200000
}
```

### 路由配置示例
```json
{
  "script": {
    "enabled": true,
    "provider_id": "provider_1234567890",
    "model": "gpt-4",
    "output_format": "json",
    "params": {
      "temperature": 0.7,
      "max_tokens": 4000,
      "top_p": 0.9
    },
    "fallback_provider_id": "provider_1234567891"
  },
  "storyboard": {
    "enabled": true,
    "provider_id": "provider_1234567891",
    "model": "deepseek-chat",
    "output_format": "json",
    "params": {
      "temperature": 0.7,
      "max_tokens": 4000,
      "top_p": 0.9
    }
  },
  "image_storyboard": {
    "enabled": true,
    "provider_id": "provider_1234567892",
    "model": "nano-banana-pro",
    "output_format": "json",
    "params": {
      "temperature": 0.7,
      "max_tokens": 4000,
      "top_p": 0.9
    }
  }
}
```

## 优势

### 1. 灵活性
- 可以同时配置多个Provider
- 每个功能点可以使用不同的Provider和模型
- 支持动态切换，无需修改代码

### 2. 可靠性
- Fallback机制提高可用性
- 主Provider失败时自动切换备用Provider
- 未配置时自动回退到本地模拟生成器

### 3. 成本优化
- 可以为不同功能选择不同价格的模型
- 例如：剧本用GPT-4，分镜用DeepSeek（更便宜）

### 4. 扩展性
- 支持多种Provider类型（LLM、Image、TTS、ASR）
- 预留文生图能力接口
- 易于添加新的Provider类型

### 5. 开发友好
- 本地开发无需真实API
- 统一的生成接口，简化调用
- 完整的TypeScript类型支持

## 下一步计划

1. ✅ 实现Providers管理UI
2. ✅ 实现功能路由配置UI
3. ✅ 实现统一生成接口
4. ✅ 实现Fallback机制
5. ⏳ 更新四个工具页面使用新接口
6. ⏳ 实现文生图功能UI
7. ⏳ 添加TTS和ASR支持（可选）

## 相关文档
- [CHANGELOG.md](../CHANGELOG.md)
- [TODO.md](../TODO.md)
- [调试模式配置说明](./DEBUG_MODE.md)

## 版本信息
- 版本：v2.9.0
- 发布日期：2026-01-24
- 状态：核心功能已完成，工具页面集成进行中
