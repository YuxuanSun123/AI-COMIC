# 剧本生成器完整工作流说明文档

## 概述

本文档详细说明AICM Workshop v2.5.0中剧本生成器的完整工作流实现，包括UI结构、数据流、AI接口、工具联动等核心功能。

---

## 一、功能架构

### 1.1 核心目标

- ✅ 实现真实的剧本生成工作流
- ✅ 固化数据结构，为后续工具联动做准备
- ✅ 预留AI API接口（默认使用mock）
- ✅ 支持中英文生成
- ✅ 支持从已有作品载入

### 1.2 技术栈

- React + TypeScript
- localStorage（数据持久化）
- AI Client（预留真实API）
- Mock Generator（本地模拟生成）

---

## 二、UI结构（三栏布局）

### 2.1 左栏：基础设置

#### 题材类型（genre）
- 爱情（romance）
- 科幻（scifi）
- 悬疑（mystery）
- 校园（campus）
- 家庭（family）
- 惊悚（thriller）

#### 语言选择（lang）
- 中文（zh）
- English（en）

#### 来源作品选择（可选）
- 下拉列表显示当前用户的所有剧本作品
- 选择后自动载入该作品的所有设定
- 用于快速迭代和修改已有剧本

### 2.2 中栏：作者输入 + 生成 + 编辑

#### 作品标题
- 必填字段
- 用于保存时的作品名称

#### 故事概述（Logline）
- 必填字段
- 用一句话概括故事核心
- 示例："一个程序员意外穿越到古代，用现代知识改变历史"

#### 世界观/设定（World）
- 可选字段
- 描述故事发生的世界、背景、时代
- 示例："2077年的赛博朋克都市，科技高度发达但贫富差距巨大"

#### 角色列表（Characters）
- 可增删改
- 每个角色包含三个字段：
  - **角色名**（name）：必填
  - **性格特征**（traits）：如"冷静、理性、有正义感"
  - **关系/身份**（relation）：如"主角、侦探、30岁"

#### 约束条件（Constraints）
- 可选字段
- 禁忌内容：不能出现的元素
- 必须出现的元素：必须包含的情节或场景

#### 生成按钮
- 点击后调用AI生成剧本
- 显示loading状态（2秒模拟延迟）
- 生成失败时显示错误提示

#### 结果编辑器
- 生成后显示完整剧本文字
- 支持手动编辑
- 使用等宽字体，便于阅读

#### 操作按钮
- **保存**：更新当前作品（如果是新作品则创建）
- **另存为**：创建新作品（标题自动添加"(副本)"）
- **生成分镜**：跳转到分镜生成器，并传递当前剧本ID

### 2.3 右栏：参数面板 + 统计信息

#### 长度级别（length_level）
- 短篇（short）：500-800字
- 中篇（mid）：800-1500字
- 长篇（long）：1500-2500字

#### 节奏（pace）
- 慢节奏（slow）
- 中等节奏（mid）
- 快节奏（fast）

#### 创意度（temperature）
- 滑条：0.0 - 1.0
- 数值越高，生成内容越有创意
- 默认：0.7

#### 风格标签（style_tag）
- 中文：国漫、赛博、热血、恋爱喜剧、悬疑推理、科幻未来
- 英文：Chinese Style、Cyberpunk、Hot-blooded、Rom-Com、Mystery、Sci-Fi

#### 统计信息（生成后显示）
- 场景数
- 角色数
- 字数

---

## 三、数据结构（固化标准）

### 3.1 EnhancedScriptContent

```typescript
interface EnhancedScriptContent {
  genre: string;                    // 题材
  lang: 'zh' | 'en';                // 语言
  logline: string;                  // 一句话概述
  world: string;                    // 世界观/设定
  characters: Character[];          // 角色列表
  constraints?: string;             // 约束条件
  params: ScriptParams;             // 生成参数
  script_text: string;              // 完整剧本文字
  scenes: EnhancedScene[];          // 结构化场景列表
  updated_from: {
    source_script_id: string | null; // 来源剧本ID
  };
}
```

### 3.2 Character

```typescript
interface Character {
  name: string;       // 角色名
  traits: string;     // 性格特征
  relation: string;   // 关系/身份
}
```

### 3.3 ScriptParams

```typescript
interface ScriptParams {
  length_level: 'short' | 'mid' | 'long'; // 长度级别
  pace: 'slow' | 'mid' | 'fast';          // 节奏
  temperature: number;                     // 温度（0-1）
  style_tag: string;                       // 风格标签
}
```

### 3.4 EnhancedScene

```typescript
interface EnhancedScene {
  scene_no: number;                        // 场景编号
  location: string;                        // 地点
  summary: string;                         // 场景摘要
  dialogues: Array<{                       // 对话列表
    speaker: string;
    line: string;
  }>;
  actions: string[];                       // 动作描述
  camera_suggestions: string;              // 镜头建议
}
```

### 3.5 数据用途

- **script_text**：供编辑器展示和导出，用户可手动编辑
- **scenes[]**：供分镜生成器使用，结构化数据便于自动拆镜头
- **updated_from.source_script_id**：记录来源，支持版本追溯

---

## 四、AI客户端（aiClient.ts）

### 4.1 配置项

```typescript
const USE_REAL_API = false;  // 默认关闭真实API
const API_BASE = '/api';     // 预留API基础路径
```

### 4.2 核心方法

#### generateScript(payload)

**输入（payload）**：
```typescript
{
  user: {
    id: string;
    nickname: string;
    membership_tier: string;
  };
  lang: 'zh' | 'en';
  genre: string;
  input: {
    logline: string;
    world: string;
    characters: Character[];
    constraints?: string;
  };
  params: {
    length_level: 'short' | 'mid' | 'long';
    pace: 'slow' | 'mid' | 'fast';
    temperature: number;
    style_tag: string;
  };
  meta: {
    client: string;
    version: string;
  };
}
```

**输出**：
```typescript
{
  ok: boolean;
  data?: {
    script_text: string;
    scenes: EnhancedScene[];
  };
  error?: {
    code: string;
    message: string;
  };
}
```

### 4.3 预留方法（暂未实现）

- `generateStoryboard(payload)` - 生成分镜
- `generateVideoCards(payload)` - 生成镜头卡
- `generateEditPlan(payload)` - 生成剪辑计划

### 4.4 API约定（预留）

#### 请求
```
POST /api/generate/script
Content-Type: application/json

{payload}
```

#### 成功响应
```json
{
  "ok": true,
  "data": {
    "script_text": "...",
    "scenes": [...]
  }
}
```

#### 错误响应
```json
{
  "ok": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "..."
  }
}
```

---

## 五、Mock生成器（mockGenerator.ts）

### 5.1 核心逻辑

#### mockGenerateScript(payload)

1. **模拟网络延迟**：2秒
2. **根据参数生成场景数量**：
   - short: 3个场景
   - mid: 5个场景
   - long: 8个场景
3. **根据题材和风格生成内容**：
   - 不同题材使用不同的场景地点
   - 不同风格使用不同的话术
4. **生成结构化场景**：
   - 场景编号、地点、摘要
   - 对话列表（根据角色生成）
   - 动作描述
   - 镜头建议
5. **生成完整剧本文字**：
   - 标题和概述
   - 世界观设定
   - 主要角色
   - 场景详情
   - 结尾

### 5.2 题材对应的场景地点

#### 爱情（romance）
- 中文：咖啡厅、校园操场、图书馆、海边、公园、电影院、家中客厅、天台
- 英文：Cafe、School Playground、Library、Beach、Park、Cinema、Living Room、Rooftop

#### 科幻（scifi）
- 中文：太空站、实验室、控制中心、飞船驾驶舱、地下基地、虚拟空间、废墟、未来城市
- 英文：Space Station、Laboratory、Control Center、Spaceship Cockpit、Underground Base、Virtual Space、Ruins、Future City

#### 悬疑（mystery）
- 中文：案发现场、警察局、废弃工厂、密室、图书馆、老宅、地下室、档案室
- 英文：Crime Scene、Police Station、Abandoned Factory、Secret Room、Library、Old Mansion、Basement、Archive Room

#### 校园（campus）
- 中文：教室、操场、食堂、图书馆、社团活动室、校门口、宿舍、体育馆
- 英文：Classroom、Playground、Cafeteria、Library、Club Room、School Gate、Dormitory、Gymnasium

#### 家庭（family）
- 中文：家中客厅、厨房、卧室、餐厅、阳台、花园、车库、书房
- 英文：Living Room、Kitchen、Bedroom、Dining Room、Balcony、Garden、Garage、Study

#### 惊悚（thriller）
- 中文：黑暗小巷、废弃医院、森林深处、地下停车场、老旧公寓、荒废游乐园、隧道、仓库
- 英文：Dark Alley、Abandoned Hospital、Deep Forest、Underground Parking、Old Apartment、Abandoned Amusement Park、Tunnel、Warehouse

### 5.3 中英文支持

- **lang=zh**：所有文案、对话、描述使用中文
- **lang=en**：所有文案、对话、描述使用英文
- 保持语言一致性，不混用

---

## 六、工作流程

### 6.1 生成剧本流程

```
1. 用户填写表单
   ├─ 作品标题
   ├─ 故事概述（logline）
   ├─ 世界观（world）
   ├─ 角色列表（characters）
   └─ 约束条件（constraints）

2. 用户设置参数
   ├─ 题材类型（genre）
   ├─ 语言（lang）
   ├─ 长度级别（length_level）
   ├─ 节奏（pace）
   ├─ 创意度（temperature）
   └─ 风格标签（style_tag）

3. 点击"生成剧本"按钮
   ├─ 验证必填字段
   ├─ 组装payload
   └─ 调用aiClient.generateScript(payload)

4. AI生成（默认使用mock）
   ├─ 模拟2秒延迟
   ├─ 根据参数生成场景
   ├─ 生成完整剧本文字
   └─ 返回结果

5. 显示结果
   ├─ 将script_text写入编辑器
   ├─ 保存generatedContent
   └─ 显示统计信息

6. 用户编辑（可选）
   └─ 手动修改剧本文字

7. 保存作品
   ├─ 点击"保存"：更新现有作品或创建新作品
   ├─ 点击"另存为"：创建新作品（标题添加"(副本)"）
   └─ 数据持久化到localStorage
```

### 6.2 从已有作品载入流程

```
1. 用户选择来源作品
   └─ 左栏下拉列表选择已有剧本

2. 系统载入作品
   ├─ 读取works表中的数据
   ├─ 解析EnhancedScriptContent
   └─ 填充所有表单字段

3. 用户修改（可选）
   ├─ 修改任意字段
   └─ 调整参数

4. 重新生成
   ├─ 点击"生成剧本"
   └─ 基于新设定生成新剧本

5. 保存
   ├─ 点击"保存"：覆盖原作品
   └─ 点击"另存为"：创建新作品
```

### 6.3 工具联动流程

```
1. 用户完成剧本生成
   └─ 剧本已保存，有currentWorkId

2. 点击"生成分镜"按钮
   ├─ 验证是否已保存
   ├─ 将currentWorkId写入localStorage（key: last_source_script_id）
   └─ 跳转到#/tools/storyboard

3. 分镜生成器自动载入
   ├─ 读取localStorage中的last_source_script_id
   ├─ 加载对应的剧本作品
   ├─ 解析scenes[]数据
   └─ 自动拆分为分镜列表

4. 用户继续编辑分镜
   └─ 基于剧本的结构化数据进行分镜创作
```

---

## 七、数据持久化

### 7.1 保存到works表

```typescript
{
  id: string;                          // 自动生成
  type: 'script';                      // 固定值
  title: string;                       // 用户输入
  content: EnhancedScriptContent;      // 完整内容
  author_id: string;                   // 当前用户ID
  lang: 'zh' | 'en';                   // 语言
  created_ms: number;                  // 创建时间戳
  updated_ms: number;                  // 更新时间戳
}
```

### 7.2 localStorage结构

```
works: [
  {
    id: "w1",
    type: "script",
    title: "示例剧本",
    content: {
      genre: "romance",
      lang: "zh",
      logline: "...",
      world: "...",
      characters: [...],
      params: {...},
      script_text: "...",
      scenes: [...],
      updated_from: {
        source_script_id: null
      }
    },
    author_id: "u1",
    lang: "zh",
    created_ms: 1672531200000,
    updated_ms: 1672531200000
  }
]
```

---

## 八、错误处理

### 8.1 表单验证

- **未登录**：提示"请先登录"
- **logline为空**：提示"请填写故事概述"
- **characters为空**：提示"请至少添加一个角色"
- **title为空**（保存时）：提示"请先生成剧本并填写标题"

### 8.2 生成错误

- **网络错误**：显示错误码和错误信息
- **Mock错误**：显示"Mock生成失败"
- **超时**：显示"请求超时，请重试"

### 8.3 保存错误

- **未生成剧本**：提示"请先生成剧本"
- **未填写标题**：提示"请填写标题"
- **localStorage满**：提示"存储空间不足"

---

## 九、后续扩展

### 9.1 分镜生成器联动

- 读取剧本的scenes[]数据
- 自动拆分为分镜列表
- 每个scene对应多个shot
- 继承camera_suggestions作为初始镜头设置

### 9.2 镜头卡生成器联动

- 读取分镜的shot[]数据
- 生成镜头卡列表
- 继承image_description和camera_position

### 9.3 剪辑合成联动

- 读取镜头卡的card[]数据
- 生成剪辑清单
- 继承素材需求和时长信息

### 9.4 真实API接入

1. 修改aiClient.ts中的USE_REAL_API为true
2. 配置API_BASE为真实API地址
3. 实现后端API接口（POST /api/generate/script）
4. 处理真实的网络请求和响应
5. 添加认证和权限控制

---

## 十、测试场景

### 10.1 基础功能测试

1. **新建剧本**
   - 填写所有字段
   - 点击生成
   - 验证生成结果
   - 保存作品

2. **从已有作品载入**
   - 选择来源作品
   - 验证字段自动填充
   - 修改部分字段
   - 重新生成
   - 另存为新作品

3. **角色管理**
   - 添加多个角色
   - 编辑角色信息
   - 删除角色
   - 验证生成结果中包含角色对话

4. **参数调整**
   - 修改长度级别，验证生成字数
   - 修改节奏，验证场景节奏
   - 修改创意度，验证内容变化
   - 修改风格标签，验证风格差异

5. **中英文切换**
   - 切换语言为英文
   - 生成剧本
   - 验证所有文案为英文
   - 切换回中文，验证中文生成

### 10.2 工具联动测试

1. **生成分镜**
   - 完成剧本生成并保存
   - 点击"生成分镜"按钮
   - 验证跳转到分镜生成器
   - 验证localStorage中有last_source_script_id
   - 验证分镜生成器自动载入剧本

### 10.3 边界情况测试

1. **未登录**
   - 尝试生成剧本
   - 验证提示"请先登录"

2. **必填字段为空**
   - logline为空，点击生成
   - 验证提示"请填写故事概述"
   - characters为空，点击生成
   - 验证提示"请至少添加一个角色"

3. **未保存直接生成分镜**
   - 生成剧本但不保存
   - 点击"生成分镜"
   - 验证提示"请先保存剧本"

4. **编辑后保存**
   - 生成剧本
   - 手动编辑script_text
   - 保存
   - 重新加载，验证编辑内容已保存

---

## 十一、性能优化

### 11.1 已实现

- 使用React Hooks避免不必要的重渲染
- 角色列表使用key优化渲染
- 表单字段使用受控组件
- localStorage读写优化

### 11.2 待优化

- 大文本编辑器性能优化（虚拟滚动）
- 生成结果缓存（避免重复生成）
- 图片懒加载（如果添加封面图）
- 分页加载作品列表（如果作品数量很多）

---

## 十二、安全性

### 12.1 已实现

- 用户权限验证（只能操作自己的作品）
- 表单输入验证
- localStorage数据校验

### 12.2 待加强

- XSS防护（输入内容转义）
- CSRF防护（真实API接入时）
- 敏感信息加密（如果涉及付费内容）
- 频率限制（防止滥用生成接口）

---

## 十三、总结

AICM Workshop v2.5.0成功实现了剧本生成器的完整工作流，包括：

✅ **完整的UI结构**：三栏布局，左栏设置、中栏输入/生成/编辑、右栏参数/统计
✅ **固化的数据结构**：EnhancedScriptContent，为后续工具联动奠定基础
✅ **预留的API接口**：aiClient模块，支持未来接入真实AI服务
✅ **智能的Mock生成器**：根据题材和风格生成不同内容，支持中英文
✅ **完善的工具联动**：生成分镜按钮，通过localStorage传递数据
✅ **友好的用户体验**：角色管理、来源作品选择、统计信息、错误提示

下一步可以基于此实现分镜生成器、镜头卡生成器、剪辑合成的联动功能，形成完整的漫剧创作工具链！

---

**版本**: v2.5.0  
**完成日期**: 2026-01-19  
**状态**: ✅ 完成并通过测试
