# AICM Workshop API 文档

## 基础信息

- **Base URL**: `https://api.aicmworkshop.com`
- **版本**: v1
- **协议**: HTTPS
- **格式**: JSON

## 认证

所有需要认证的接口使用 Bearer Token：

```
Authorization: Bearer {token}
```

## 统一响应格式

### 成功响应

```json
{
  "ok": true,
  "data": { /* 数据内容 */ }
}
```

### 错误响应

```json
{
  "ok": false,
  "error": {
    "code": 400,
    "message": "错误描述"
  }
}
```

### 错误码

| 错误码 | 说明 | 场景 |
|--------|------|------|
| 400 | 请求参数错误 | 字段格式错误、缺少必填字段 |
| 401 | 未登录 | Token缺失或无效 |
| 403 | 无权限 | 尝试访问他人资源 |
| 404 | 资源不存在 | 查询的ID不存在 |
| 409 | 冲突 | 邮箱已被注册 |
| 422 | 校验失败 | 字段验证失败 |
| 429 | 请求过多 | 超过速率限制 |
| 500 | 服务器错误 | 内部错误 |

---

## 认证接口

### 注册

**POST** `/api/auth/register`

**请求体**：
```json
{
  "email": "user@example.com",
  "nickname": "用户昵称",
  "password": "password123"
}
```

**响应**：
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "u123",
      "nickname": "用户昵称",
      "email": "user@example.com",
      "membership_tier": "free"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误**：
- 409: 邮箱已被注册
- 422: 字段验证失败

---

### 登录

**POST** `/api/auth/login`

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**：
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "u123",
      "nickname": "用户昵称",
      "email": "user@example.com",
      "membership_tier": "free"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误**：
- 401: 邮箱或密码错误

---

### 退出登录

**POST** `/api/auth/logout`

**请求头**：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "ok": true,
  "data": true
}
```

---

## 用户接口

### 获取当前用户信息

**GET** `/api/users/me`

**请求头**：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "ok": true,
  "data": {
    "id": "u123",
    "nickname": "用户昵称",
    "email": "user@example.com",
    "membership_tier": "free",
    "created_ms": 1672531200000,
    "updated_ms": 1672531200000
  }
}
```

---

### 更新用户信息

**PATCH** `/api/users/me`

**请求头**：
```
Authorization: Bearer {token}
```

**请求体**：
```json
{
  "nickname": "新昵称",
  "membership_tier": "pro"
}
```

**响应**：
```json
{
  "ok": true,
  "data": {
    "id": "u123",
    "nickname": "新昵称",
    "email": "user@example.com",
    "membership_tier": "pro",
    "created_ms": 1672531200000,
    "updated_ms": 1672617600000
  }
}
```

---

## 作品接口

### 查询作品列表

**GET** `/api/works`

**请求头**：
```
Authorization: Bearer {token}
```

**查询参数**：
- `type` (可选): 作品类型 (script/storyboard/video_cards/edit_plan)
- `q` (可选): 搜索关键词
- `sort` (可选): 排序字段 (created_ms/updated_ms)
- `order` (可选): 排序方向 (asc/desc)
- `limit` (可选): 每页数量，默认20
- `offset` (可选): 偏移量，默认0

**示例**：
```
GET /api/works?type=script&sort=updated_ms&order=desc&limit=10&offset=0
```

**响应**：
```json
{
  "ok": true,
  "data": [
    {
      "id": "w123",
      "type": "script",
      "title": "我的剧本",
      "content": { /* 剧本内容 */ },
      "author_id": "u123",
      "lang": "zh",
      "created_ms": 1672531200000,
      "updated_ms": 1672617600000
    }
  ]
}
```

---

### 获取作品详情

**GET** `/api/works/:id`

**请求头**：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "ok": true,
  "data": {
    "id": "w123",
    "type": "script",
    "title": "我的剧本",
    "content": { /* 剧本内容 */ },
    "author_id": "u123",
    "lang": "zh",
    "created_ms": 1672531200000,
    "updated_ms": 1672617600000
  }
}
```

**错误**：
- 404: 作品不存在
- 403: 无权访问（不是作者）

---

### 创建作品

**POST** `/api/works`

**请求头**：
```
Authorization: Bearer {token}
```

**请求体**：
```json
{
  "type": "script",
  "title": "我的剧本",
  "content": {
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
                "line": "你好"
              }
            ],
            "actions": ["女主角走过来"],
            "camera_suggestions": "中景镜头"
          }
        ]
      }
    ]
  },
  "lang": "zh"
}
```

**响应**：
```json
{
  "ok": true,
  "data": {
    "id": "w123",
    "type": "script",
    "title": "我的剧本",
    "content": { /* 剧本内容 */ },
    "author_id": "u123",
    "lang": "zh",
    "created_ms": 1672531200000,
    "updated_ms": 1672531200000
  }
}
```

---

### 更新作品

**PATCH** `/api/works/:id`

**请求头**：
```
Authorization: Bearer {token}
```

**请求体**：
```json
{
  "title": "新标题",
  "content": { /* 更新的内容 */ }
}
```

**响应**：
```json
{
  "ok": true,
  "data": {
    "id": "w123",
    "type": "script",
    "title": "新标题",
    "content": { /* 更新的内容 */ },
    "author_id": "u123",
    "lang": "zh",
    "created_ms": 1672531200000,
    "updated_ms": 1672617600000
  }
}
```

**错误**：
- 404: 作品不存在
- 403: 无权修改（不是作者）

---

### 删除作品

**DELETE** `/api/works/:id`

**请求头**：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "ok": true,
  "data": true
}
```

**错误**：
- 404: 作品不存在
- 403: 无权删除（不是作者）

---

## 新闻接口

### 查询新闻列表

**GET** `/api/news`

**查询参数**：
- `tag` (可选): 标签筛选
- `q` (可选): 搜索关键词
- `limit` (可选): 每页数量，默认20
- `offset` (可选): 偏移量，默认0

**响应**：
```json
{
  "ok": true,
  "data": [
    {
      "id": "n123",
      "title": "新闻标题",
      "summary": "新闻摘要",
      "content": "新闻内容",
      "tags": ["行业趋势", "技术发展"],
      "author_id": "u123",
      "created_ms": 1672531200000,
      "updated_ms": 1672531200000
    }
  ]
}
```

---

### 获取新闻详情

**GET** `/api/news/:id`

**响应**：
```json
{
  "ok": true,
  "data": {
    "id": "n123",
    "title": "新闻标题",
    "summary": "新闻摘要",
    "content": "新闻内容",
    "tags": ["行业趋势", "技术发展"],
    "author_id": "u123",
    "created_ms": 1672531200000,
    "updated_ms": 1672531200000
  }
}
```

---

### 创建新闻

**POST** `/api/news`

**请求头**：
```
Authorization: Bearer {token}
```

**请求体**：
```json
{
  "title": "新闻标题",
  "summary": "新闻摘要",
  "content": "新闻内容",
  "tags": ["行业趋势", "技术发展"]
}
```

**响应**：
```json
{
  "ok": true,
  "data": {
    "id": "n123",
    "title": "新闻标题",
    "summary": "新闻摘要",
    "content": "新闻内容",
    "tags": ["行业趋势", "技术发展"],
    "author_id": "u123",
    "created_ms": 1672531200000,
    "updated_ms": 1672531200000
  }
}
```

---

### 更新新闻

**PATCH** `/api/news/:id`

**请求头**：
```
Authorization: Bearer {token}
```

**请求体**：
```json
{
  "title": "新标题",
  "content": "新内容"
}
```

**响应**：同创建新闻

**错误**：
- 404: 新闻不存在
- 403: 无权修改（不是作者）

---

### 删除新闻

**DELETE** `/api/news/:id`

**请求头**：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "ok": true,
  "data": true
}
```

**错误**：
- 404: 新闻不存在
- 403: 无权删除（不是作者）

---

## 友情链接接口

### 查询链接列表

**GET** `/api/links`

**响应**：
```json
{
  "ok": true,
  "data": [
    {
      "id": "l123",
      "name": "动漫之家",
      "url": "https://www.dongmanhome.com",
      "desc": "综合性动漫资讯平台",
      "tags": ["资讯", "社区"],
      "author_id": "u123",
      "created_ms": 1672531200000,
      "updated_ms": 1672531200000
    }
  ]
}
```

---

### 创建链接

**POST** `/api/links`

**请求头**：
```
Authorization: Bearer {token}
```

**请求体**：
```json
{
  "name": "动漫之家",
  "url": "https://www.dongmanhome.com",
  "desc": "综合性动漫资讯平台",
  "tags": ["资讯", "社区"]
}
```

**响应**：同查询链接列表中的单个对象

---

### 更新链接

**PATCH** `/api/links/:id`

**请求头**：
```
Authorization: Bearer {token}
```

**请求体**：
```json
{
  "name": "新名称",
  "url": "https://new-url.com"
}
```

**响应**：同创建链接

**错误**：
- 404: 链接不存在
- 403: 无权修改（不是作者）

---

### 删除链接

**DELETE** `/api/links/:id`

**请求头**：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "ok": true,
  "data": true
}
```

**错误**：
- 404: 链接不存在
- 403: 无权删除（不是作者）

---

## AI生成接口

### 生成剧本

**POST** `/api/ai/generate/script`

**请求头**：
```
Authorization: Bearer {token}
```

**请求体**：
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

**响应**：
```json
{
  "ok": true,
  "data": {
    "content_text": "生成的剧本文本...",
    "content_json": {
      "acts": [
        {
          "act_number": 1,
          "scenes": [ /* ... */ ]
        }
      ]
    }
  }
}
```

---

### 生成分镜

**POST** `/api/ai/generate/storyboard`

**请求体**：
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

**响应**：
```json
{
  "ok": true,
  "data": {
    "content_json": {
      "shots": [
        {
          "shot_number": 1,
          "scene": "画面描述",
          "action": "动作描述",
          "camera": "机位",
          "dialogue": "对白"
        }
      ]
    }
  }
}
```

---

### 生成镜头卡

**POST** `/api/ai/generate/video_cards`

**请求体**：
```json
{
  "lang": "zh",
  "inputs": {
    "storyboard": "分镜内容..."
  }
}
```

**响应**：
```json
{
  "ok": true,
  "data": {
    "content_json": {
      "cards": [
        {
          "scene": "画面描述",
          "action": "动作",
          "lighting": "光影氛围",
          "narration": "旁白台词",
          "prompt": "AI生成提示词",
          "order": 1
        }
      ]
    }
  }
}
```

---

### 生成剪辑计划

**POST** `/api/ai/generate/edit_plan`

**请求体**：
```json
{
  "lang": "zh",
  "inputs": {
    "video_cards": "镜头卡内容..."
  }
}
```

**响应**：
```json
{
  "ok": true,
  "data": {
    "content_json": {
      "clips": [
        {
          "shot_number": "001",
          "material": "素材需求",
          "audio": "音效配音",
          "transition": "转场效果",
          "duration": "5s",
          "notes": "备注",
          "order": 1
        }
      ]
    }
  }
}
```

---

## 速率限制

- 认证接口：10次/分钟
- 查询接口：100次/分钟
- 创建/更新接口：30次/分钟
- AI生成接口：5次/分钟

超过限制返回 429 错误。

---

## WebSocket (未来支持)

### 连接
```
wss://api.aicmworkshop.com/ws?token={token}
```

### 实时通知
- 作品更新通知
- 协作编辑同步
- AI生成进度

---

## 数据模型

### User
```typescript
interface User {
  id: string;
  nickname: string;
  email: string;
  membership_tier: 'free' | 'pro' | 'studio';
  created_ms: number;
  updated_ms: number;
}
```

### Work
```typescript
interface Work {
  id: string;
  type: 'script' | 'storyboard' | 'video_cards' | 'edit_plan';
  title: string;
  content: object;
  author_id: string;
  lang: 'zh' | 'en';
  created_ms: number;
  updated_ms: number;
}
```

### News
```typescript
interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  author_id: string;
  created_ms: number;
  updated_ms: number;
}
```

### Link
```typescript
interface Link {
  id: string;
  name: string;
  url: string;
  desc: string;
  tags: string[];
  author_id: string;
  created_ms: number;
  updated_ms: number;
}
```

---

## 测试环境

- **Base URL**: `https://api-dev.aicmworkshop.com`
- **测试账号**: test@example.com / test123

---

## 更新日志

### v1.0.0 (2026-01-19)
- 初始版本
- 基础CRUD接口
- AI生成接口预留

---

**文档版本**：v1.0  
**最后更新**：2026-01-19  
**维护者**：AICM Workshop Team
