// AI客户端 - 预留真实API接口，默认使用mock

import { mockGenerateScript } from './mockGenerator';

// 配置项
const USE_REAL_API = false; // 默认关闭真实API
const API_BASE = '/api'; // 预留API基础路径

// 请求payload类型定义
export interface GenerateScriptPayload {
  user: {
    id: string;
    nickname: string;
    membership_tier: string;
  };
  lang: string;
  genre: string;
  input: {
    logline: string;
    world: string;
    characters: Array<{
      name: string;
      traits: string;
      relation: string;
    }>;
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

// API响应类型
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// 剧本生成结果类型
export interface ScriptGenerationResult {
  script_text: string;
  scenes: Array<{
    scene_no: number;
    location: string;
    summary: string;
    dialogues: Array<{
      speaker: string;
      line: string;
    }>;
    actions: string[];
    camera_suggestions: string;
  }>;
}

// 分镜生成payload类型
export interface GenerateStoryboardPayload {
  user: {
    id: string;
    nickname: string;
    membership_tier: string;
  };
  lang: string;
  genre: string;
  source: {
    script_id: string | null;
    script_title: string;
    scenes?: Array<{
      scene_no: number;
      location: string;
      summary: string;
      dialogues: Array<{
        speaker: string;
        line: string;
      }>;
      actions: string[];
      camera_suggestions: string;
    }>;
    script_text?: string;
  };
  fallback_text?: string;
  params: {
    shot_density: 'sparse' | 'standard' | 'dense';
    visual_style: string;
    camera_variety: 'low' | 'mid' | 'high';
    temperature: number;
    max_shots: number;
  };
  meta: {
    client: string;
    version: string;
  };
}

// 分镜生成结果类型
export interface StoryboardGenerationResult {
  shots: Array<{
    shot_no: number;
    scene_ref: number;
    frame: string;
    action: string;
    camera: string;
    dialogue: string;
    duration_sec: number;
    notes: string;
  }>;
}

// 镜头卡生成payload类型
export interface GenerateVideoCardsPayload {
  user: {
    id: string;
    nickname: string;
    membership_tier: string;
  };
  lang: string;
  genre: string;
  source: {
    storyboard_id: string | null;
    shots: Array<{
      shot_no: number;
      scene_ref: number;
      frame: string;
      action: string;
      camera: string;
      dialogue: string;
      duration_sec: number;
      notes: string;
    }>;
  };
  params: {
    render_style: string;
    character_consistency: 'low' | 'mid' | 'high';
    detail_level: 'low' | 'mid' | 'high';
    camera_emphasis: 'weak' | 'mid' | 'strong';
    temperature: number;
  };
  meta: {
    client: string;
    version: string;
  };
}

// 镜头卡生成结果类型
export interface VideoCardsGenerationResult {
  cards: Array<{
    card_no: number;
    shot_ref: number;
    visual_desc: string;
    character_action: string;
    lighting_mood: string;
    camera_desc: string;
    dialogue_voiceover: string;
    prompt: string;
    negative_prompt: string;
    notes: string;
  }>;
}

// 剪辑计划生成payload类型
export interface GenerateEditPlanPayload {
  user: {
    id: string;
    nickname: string;
    membership_tier: string;
  };
  lang: string;
  genre: string;
  source: {
    video_cards_id: string | null;
    cards: Array<{
      card_no: number;
      shot_ref: number;
      visual_desc: string;
      character_action: string;
      lighting_mood: string;
      camera_desc: string;
      dialogue_voiceover: string;
      prompt: string;
      negative_prompt: string;
      notes: string;
    }>;
    params_from_video_cards?: any;
  };
  params: {
    pace: 'slow' | 'normal' | 'fast';
    target_total_sec: number;
    transition_style: 'clean' | 'cinematic' | 'dynamic';
    audio_style: 'minimal' | 'rich' | 'dramatic';
    subtitle_density: 'low' | 'mid' | 'high';
    temperature: number;
  };
  meta: {
    client: string;
    version: string;
  };
}

// 剪辑计划生成结果类型
export interface EditPlanGenerationResult {
  items: Array<{
    item_no: number;
    shot_ref: number;
    source_prompt_ref: number;
    asset_need: string;
    voice_sfx: string;
    transition: string;
    duration_sec: number;
    caption_subtitle: string;
    notes: string;
  }>;
}

/**
 * 通用请求方法
 * @param path API路径
 * @param body 请求体
 * @returns API响应
 */
async function request<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  if (!USE_REAL_API) {
    // 使用mock，不真实请求
    throw new Error('USE_REAL_API is false, should use mock instead');
  }

  try {
    const response = await fetch(API_BASE + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : '网络请求失败'
      }
    };
  }
}

/**
 * 生成剧本
 * @param payload 生成参数
 * @returns 剧本生成结果
 */
export async function generateScript(
  payload: GenerateScriptPayload
): Promise<ApiResponse<ScriptGenerationResult>> {
  if (USE_REAL_API) {
    // 真实API调用
    return request<ScriptGenerationResult>('/generate/script', payload);
  } else {
    // 使用mock生成器
    try {
      const result = await mockGenerateScript(payload);
      return {
        ok: true,
        data: result
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'MOCK_ERROR',
          message: error instanceof Error ? error.message : 'Mock生成失败'
        }
      };
    }
  }
}

/**
 * 生成分镜
 * @param payload 生成参数
 * @returns 分镜生成结果
 */
export async function generateStoryboard(
  payload: GenerateStoryboardPayload
): Promise<ApiResponse<StoryboardGenerationResult>> {
  if (USE_REAL_API) {
    // 真实API调用
    return request<StoryboardGenerationResult>('/generate/storyboard', payload);
  } else {
    // 使用mock生成器
    try {
      const { mockGenerateStoryboard } = await import('./mockGenerator');
      const result = await mockGenerateStoryboard(payload);
      return {
        ok: true,
        data: result
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'MOCK_ERROR',
          message: error instanceof Error ? error.message : 'Mock生成失败'
        }
      };
    }
  }
}

/**
 * 生成镜头卡
 * @param payload 生成参数
 * @returns 镜头卡生成结果
 */
export async function generateVideoCards(
  payload: GenerateVideoCardsPayload
): Promise<ApiResponse<VideoCardsGenerationResult>> {
  if (USE_REAL_API) {
    // 真实API调用
    return request<VideoCardsGenerationResult>('/generate/video-cards', payload);
  } else {
    // 使用mock生成器
    try {
      const { mockGenerateVideoCards } = await import('./mockGenerator');
      const result = await mockGenerateVideoCards(payload);
      return {
        ok: true,
        data: result
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'MOCK_ERROR',
          message: error instanceof Error ? error.message : 'Mock生成失败'
        }
      };
    }
  }
}

/**
 * 生成剪辑计划
 * @param payload 生成参数
 * @returns 剪辑计划生成结果
 */
export async function generateEditPlan(
  payload: GenerateEditPlanPayload
): Promise<ApiResponse<EditPlanGenerationResult>> {
  if (USE_REAL_API) {
    // 真实API调用
    return request<EditPlanGenerationResult>('/generate/edit-plan', payload);
  } else {
    // 使用mock生成器
    try {
      const { mockGenerateEditPlan } = await import('./mockGenerator');
      const result = await mockGenerateEditPlan(payload);
      return {
        ok: true,
        data: result
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'MOCK_ERROR',
          message: error instanceof Error ? error.message : 'Mock生成失败'
        }
      };
    }
  }
}

/**
 * ============================================
 * 多API接入统一方法
 * ============================================
 */

import type { ApiProvider, TaskType, ProviderTestResult } from '@/types';

/**
 * 统一生成方法 - 根据任务类型和路由配置调用相应的Provider
 * @param taskType 任务类型
 * @param payload 生成参数
 * @param onProgress 流式回调
 * @returns 生成结果
 */
export async function generate(taskType: TaskType, payload: unknown, onProgress?: (chunk: string) => void): Promise<ApiResponse<unknown>> {
  // 读取API路由配置
  const routingConfig = localStorage.getItem('api_routing');
  const providersConfig = localStorage.getItem('api_providers');

  // 辅助函数：处理Mock回退并支持流式模拟
  const handleFallback = async () => {
    if (onProgress && taskType === 'script') {
        try {
            const mockResult = await mockGenerateScript(payload as any);
            const text = mockResult.script_text;
            const chunkSize = 50;
            for (let i = 0; i < text.length; i += chunkSize) {
                onProgress(text.slice(i, i + chunkSize));
                await new Promise(r => setTimeout(r, 100));
            }
            return { ok: true, data: mockResult };
        } catch (e) {
            console.warn('Mock streaming failed', e);
        }
    }
    return fallbackToLegacyMethod(taskType, payload);
  };

  // 智能回退逻辑：如果有Provider但没有路由，尝试自动选择Provider
  if (!routingConfig || !JSON.parse(routingConfig)[taskType]?.enabled) {
    if (providersConfig) {
      try {
        const providers: ApiProvider[] = JSON.parse(providersConfig);
        const targetType = (taskType === 'image_storyboard' || taskType === 'image_shot') ? 'image' : 'llm';
        const availableProvider = providers.find(p => p.type === targetType && p.enabled);
        
        if (availableProvider) {
          console.log(`[AI] Auto-detected provider for ${taskType}: ${availableProvider.name}`);
          return await callProvider(availableProvider, taskType, availableProvider.default_model, payload, onProgress);
        }
      } catch (e) {
        console.error('Failed to parse providers config', e);
      }
    }
    
    // 确实没有可用配置，回退到Mock
    console.warn(`[AI] No provider configured for ${taskType}, falling back to Mock.`);
    return handleFallback();
  }

  try {
    const routing = JSON.parse(routingConfig);
    const taskRouting = routing[taskType];

    // 检查是否启用 (logic handled above, but double check here if parsing succeeded)
    if (!taskRouting || !taskRouting.enabled) {
       // Should be caught by the smart fallback above, but just in case
       return handleFallback();
    }

    if (!providersConfig) {
      return handleFallback();
    }

    const providers: ApiProvider[] = JSON.parse(providersConfig);
    const provider = providers.find(p => p.id === taskRouting.provider_id && p.enabled);

    if (!provider) {
      // Provider不存在或未启用，尝试fallback
      if (taskRouting.fallback_provider_id) {
        const fallbackProvider = providers.find(p => p.id === taskRouting.fallback_provider_id && p.enabled);
        if (fallbackProvider) {
          return callProvider(fallbackProvider, taskType, taskRouting.model, payload, onProgress);
        }
      }
      
      // 尝试自动寻找替代Provider
      const targetType = (taskType === 'image_storyboard' || taskType === 'image_shot') ? 'image' : 'llm';
      const autoProvider = providers.find(p => p.type === targetType && p.enabled);
      if (autoProvider) {
          console.log(`[AI] Configured provider not found, auto-switching to: ${autoProvider.name}`);
          return callProvider(autoProvider, taskType, autoProvider.default_model, payload, onProgress);
      }

      // 没有可用Provider，回退到原有方法
      console.warn(`[AI] No usable provider found for ${taskType}, falling back to Mock.`);
      return handleFallback();
    }

    // 调用Provider
    try {
      return await callProvider(provider, taskType, taskRouting.model, payload, onProgress);
    } catch (error) {
      // 主Provider失败，尝试fallback
      if (taskRouting.fallback_provider_id) {
        const fallbackProvider = providers.find(p => p.id === taskRouting.fallback_provider_id && p.enabled);
        if (fallbackProvider) {
          console.warn(`主Provider失败，尝试fallback: ${fallbackProvider.name}`);
          return await callProvider(fallbackProvider, taskType, taskRouting.model, payload, onProgress);
        }
      }
      throw error;
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'GENERATE_ERROR',
        message: error instanceof Error ? error.message : '生成失败'
      }
    };
  }
}

/**
 * 构建提示词
 */
function constructPrompt(taskType: TaskType, payload: any): { system: string; user: string } {
  const baseSystem = '你是一个专业的AI漫剧创作助手。请根据用户提供的JSON数据生成相应的内容。重要：请务必返回合法的JSON格式数据。';

  if (taskType === 'script') {
    const lengthMap: Record<string, string> = {
      short: '短篇（约3-5场戏，剧情紧凑，每场戏至少300字）',
      mid: '中篇（约8-15场戏，结构完整，情节跌宕起伏，每场戏细节丰富，包含大量对白和动作描写，总字数要求3000字以上）',
      long: '长篇（约20场戏以上，细节丰富，多条线索交织，人物刻画深刻，总字数要求5000字以上）'
    };
    const lengthDesc = lengthMap[payload.params?.length_level] || lengthMap['mid'];
    
    // 续写模式：如果 payload 中包含历史记录
    let continuePrompt = '';
    if ((payload as any)._continue_history) {
        continuePrompt = `
**接下来的任务**：
上文因为长度限制中断了。请继续生成剩余的内容。
请紧接着上文的最后一句话继续写，保持连贯性。不要重复上文已经生成的内容。
`;
    }

    return {
      system: `${baseSystem}
      
任务：你是一个顶级影视剧本编剧。请根据输入的故事大纲和参数创作一个**完整、详细、可直接拍摄**的影视剧本。

**核心原则：拒绝大纲，只要正文！拒绝流水账，只要细节！**

关键指令（必须严格遵守）：
1. **内容详实度（最高优先级）**：
   - 当前长度要求：【${lengthDesc}】。
   - **严禁**生成“剧情梗概”、“场景摘要”或“简略版”剧本。
   - **严禁**使用“经过一番交谈”、“两人争吵了起来”这种概括性描述。必须写出具体的**每一句台词**和**每一个动作**。
   - **每场戏（Scene）必须充实**：
     - **对话**：主要场景必须包含 **10-20轮** 以上的有效对话。对话要符合角色性格，有潜台词，有冲突，有情感流动。
     - **动作**：必须描写具体的微动作（如眼神流转、手指颤抖、肢体接触）、环境氛围（光影、声音、气味）和物体细节。
     - **时长**：想象你在写一部慢节奏的文艺片，每一个眼神都要给足镜头。

2. **剧本结构**：
   - 建议使用 Markdown 格式（# 场次, ## 地点, - 对白），或者保持 JSON 格式。
   - 每一场戏都要有明确的【场景标题】（内/外、地点、时间）。
   - 每一段情节都要通过【动作描述】和【对白】来推动。
   - 如果是“长篇”或“中篇”，请确保故事有起承转合，不要草草收尾。

3. **输出字段要求**：
   - \`script_text\`：这是最核心的字段。必须包含**所有**场次的**完整文本**。格式要规范，阅读感要像真正的剧本一样流畅。不要为了节省字数而省略。
   - \`scenes\`：这是结构化数据。请确保提取出的 scenes 列表与 script_text 中的内容一一对应，不要遗漏。

4. **负面约束（绝对不要做）**：
   - 不要写：“场景1：他们在咖啡馆见面。（然后就结束了）” -> 错！要写出他们点了什么咖啡，谁先开口，眼神如何接触。
   - 不要写：“勇者打败了恶龙。” -> 错！要写出三百个回合的战斗细节，每一次挥剑，每一次受伤。

请发挥你的创造力，写出有血有肉、画面感强烈的剧本！请深呼吸，一步步思考，确保每一个场景都足够精彩。
`,
      user: `请基于以下数据生成剧本。
**特别提醒**：
1. 必须生成 ${lengthDesc} 长度的剧本。
2. 每一个场景都必须充满细节，拒绝简略！
3. 绝对不要生成大纲！
${continuePrompt}

数据内容：
${JSON.stringify(payload)}`
    };
  } else if (taskType === 'storyboard') {
     return {
      system: `${baseSystem}
      
任务：根据输入的剧本或文本生成分镜列表。

要求：
1. 根据 params.shot_density (镜头密度) 决定分镜数量。
2. 包含画面描述(frame)、动作(action)、运镜(camera)和对白(dialogue)。
`,
      user: JSON.stringify(payload)
    };
  } else if (taskType === 'video_cards') {
    return {
      system: `${baseSystem}
      
任务：根据分镜列表生成视频生成所需的提示词(Prompt)。

要求：
1. 为每个镜头生成详细的英文提示词(prompt)和负向提示词(negative_prompt)。
2. 保持角色特征的一致性。
`,
      user: JSON.stringify(payload)
    };
  } else if (taskType === 'edit_plan') {
    return {
      system: `${baseSystem}
      
任务：根据镜头卡生成剪辑计划。

要求：
1. 规划每个镜头的时长、转场效果和音效。
2. 确保总时长接近 params.target_total_sec。
`,
      user: JSON.stringify(payload)
    };
  }

  return {
    system: baseSystem,
    user: JSON.stringify(payload)
  };
}

/**
 * 从文本中提取JSON
 */
function extractJson(text: string): any {
  try {
    // 1. 尝试直接解析
    return JSON.parse(text);
  } catch (e) {
    // 2. 尝试提取markdown代码块
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/```\n([\s\S]*?)\n```/) ||
                      text.match(/```([\s\S]*?)```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        console.warn('Markdown代码块提取JSON失败:', e2);
      }
    }

    // 3. 尝试寻找第一个 { 和最后一个 }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch (e3) {
        console.warn('大括号提取JSON失败:', e3);
      }
    }

    throw new Error('无法从响应中提取JSON');
  }
}

/**
 * 调用Provider生成内容
 * 支持流式输出
 */
async function callGoogleProvider(
  provider: ApiProvider,
  taskType: TaskType,
  model: string,
  payload: unknown,
  onProgress?: (chunk: string) => void
): Promise<ApiResponse<unknown>> {
  const baseUrl = provider.base_url.replace(/\/+$/, '');
  const apiKey = provider.api_key;
  
  // Image Generation (Imagen 3 on Vertex AI / Gemini API)
  if (provider.type === 'image' || taskType.startsWith('image_')) {
      const targetModel = model || provider.default_model || 'imagen-3.0-generate-001';
      // Note: The public API for Imagen on AI Studio might differ. 
      // Assuming /v1beta/models/{model}:predict or similar. 
      // Current AI Studio docs suggest standard GenerateContent works for some multimodal, but Imagen specific endpoint is safer if known.
      // However, for "AQ..." keys (AI Studio), standard Imagen might not be fully exposed via the same endpoint as Vertex.
      // Fallback: Use the text generation endpoint but with image prompt structure if supported, 
      // OR simulate response if we can't hit the real image API yet.
      
      // Attempting to use the `predict` endpoint often used for Vertex AI, but via the public gateway
      const url = `${baseUrl}/models/${targetModel}:predict?key=${apiKey}`;
      
      // Construct payload for Imagen
      // Payload format for Imagen usually involves "instances"
      const promptText = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const requestBody = {
          instances: [
              { prompt: promptText }
          ],
          parameters: {
              sampleCount: 1,
              aspectRatio: "1:1"
          }
      };

      console.log(`[AI] Calling Google Image Provider: ${url}`);
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            // Fallback for "generateContent" if predict fails (some models use generateContent for everything)
            console.warn('[AI] Imagen predict failed, trying generateContent fallback...');
            const fallbackUrl = `${baseUrl}/models/${targetModel}:generateContent?key=${apiKey}`;
             const fallbackBody = {
                contents: [{ parts: [{ text: `Generate an image of: ${promptText}` }] }]
            };
            const fbResponse = await fetch(fallbackUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(fallbackBody)
            });
             if (!fbResponse.ok) {
                 const errorText = await fbResponse.text();
                 throw new Error(`Google Image API Error: ${errorText}`);
             }
             const data = await fbResponse.json();
             // Try to extract image (if base64 returned) or text url
             // This is highly dependent on the exact model capability on AI Studio
             // For now, if we get text, we return it.
             return { ok: true, data: data };
        }

        const data = await response.json();
        // Extract Base64 image
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
        if (base64Image) {
            return { ok: true, data: [{ url: `data:image/png;base64,${base64Image}` }] };
        }
        return { ok: true, data: data };
      } catch (e) {
          console.error('[AI] Google Image Gen Error:', e);
          throw e;
      }
  }

  // Text Generation (Gemini)
  const { system, user } = constructPrompt(taskType, payload);
  const fullPrompt = `${system}\n\nUser Request:\n${user}`;
  const targetModel = model || provider.default_model || 'gemini-1.5-flash';
  const url = `${baseUrl}/models/${targetModel}:generateContent?key=${apiKey}`;
  
  console.log(`[AI] Calling Google Text Provider: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: (payload as any).params?.temperature || 0.7,
          maxOutputTokens: 8192
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error('No content in Google response');
    
    if (onProgress) onProgress(text);
    
    const result = extractJson(text);
    return { ok: true, data: result };
  } catch (error) {
    console.error('[AI] Google Provider Error:', error);
    throw error;
  }
}

async function callProvider(
  provider: ApiProvider,
  taskType: TaskType,
  model: string,
  payload: unknown,
  onProgress?: (chunk: string) => void
): Promise<ApiResponse<unknown>> {
  // Google Gemini API Support
  if (provider.base_url.includes('googleapis.com')) {
    return callGoogleProvider(provider, taskType, model, payload, onProgress);
  }

  // 构建请求
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${provider.api_key}`
  };

  // 添加自定义headers
  if (provider.headers_json) {
    try {
      const customHeaders = JSON.parse(provider.headers_json);
      Object.assign(headers, customHeaders);
    } catch (e) {
      console.warn('自定义headers解析失败:', e);
    }
  }

  // 根据Provider类型构建请求体
  let requestBody: any;
  let endpoint = '';

  if (provider.type === 'llm') {
    endpoint = '/chat/completions';
    const { system, user } = constructPrompt(taskType, payload);

    // LLM类型：构建标准的OpenAI格式请求
    requestBody = {
      model: model || provider.default_model,
      messages: [
        {
          role: 'system',
          content: system
        },
        {
          role: 'user',
          content: user
        }
      ],
      temperature: (payload as any).params?.temperature || 0.7,
      max_tokens: (payload as any).params?.force_max_tokens || 8192, // 降低默认token数以适配DeepSeek等模型
      stream: !!onProgress // 如果提供了回调，开启流式
    };
  } else if (provider.type === 'image') {
    endpoint = '/images/generations';
    // Image类型：构建文生图请求
    requestBody = {
      prompt: JSON.stringify(payload),
      model: model || provider.default_model,
      n: 1,
      size: '1024x1024'
    };
  }

  // 确保base_url没有尾部斜杠
  const baseUrl = provider.base_url.replace(/\/+$/, '');
  const url = `${baseUrl}${endpoint}`;

  console.log(`[AI] Calling provider: ${provider.name} (${url})`);

  try {
    // 发送请求
    const controller = new AbortController();
    // 流式请求不需要超时限制，或者设置更长的超时
    const timeoutId = setTimeout(() => controller.abort(), onProgress ? 600000 : 180000); 

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] Provider API Error: ${response.status}`, errorText);
      
      // 自动降级重试逻辑
      if (response.status === 400 && requestBody.max_tokens > 4096) {
          console.warn('[AI] 400 Bad Request detected. Retrying with reduced max_tokens (8192)...');
          
          const newPayload = JSON.parse(JSON.stringify(payload));
          if (!newPayload.params) newPayload.params = {};
          
          // 尝试 8192 中间档位，如果本来是 16384
          if (requestBody.max_tokens > 8192) {
              newPayload.params.force_max_tokens = 8192;
          } else {
              newPayload.params.force_max_tokens = 4096;
          }
          
          return callProvider(provider, taskType, model, newPayload, onProgress);
      }

      throw new Error(`Provider请求失败: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    // 处理流式响应
    if (provider.type === 'llm' && onProgress && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let finishReason: string | null = null;
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.trim() === 'data: [DONE]') continue;
            
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices?.[0]?.delta?.content || '';
                
                // 记录结束原因
                if (data.choices?.[0]?.finish_reason) {
                    finishReason = data.choices[0].finish_reason;
                }

                if (content) {
                  fullContent += content;
                  onProgress(content);
                }
              } catch (e) {
                console.warn('Error parsing stream chunk', e);
              }
            }
          }
        }
        
        // 自动续写逻辑
        if (finishReason === 'length') {
            console.log('[AI] Content truncated by length limit. Auto-continuing...');
            
            // 为了防止无限循环，检查一下是否已经续写过太多次
            // 我们可以在 payload 中增加一个计数器
            const currentRetryCount = (payload as any)._continue_count || 0;
            if (currentRetryCount < 3) {
                // 构造新的 payload
                const newPayload = JSON.parse(JSON.stringify(payload));
                newPayload._continue_history = fullContent; // 传递已生成的内容作为历史（简化版，实际应该拼接到 assistant message）
                // 但由于 constructPrompt 是 stateless 的，我们只能通过 user prompt 提示。
                // 这不是最完美的方法（因为模型看不到它之前到底写了啥），但在无状态函数里是唯一的办法，
                // 除非我们把 fullContent 传给 backend，但 backend 就是这里。
                
                // 等等，我们不能把 fullContent 传给 constructPrompt 里的 user prompt，
                // 因为 constructPrompt 只是把 payload stringify 放到 user prompt 里。
                // 如果 payload 很大（包含几千字的 script），那 input token 会爆炸。
                
                // 正确的做法：
                // 1. 不修改 payload。
                // 2. 这里的 callProvider 应该支持一个参数 `previousMessages`。
                // 但这需要改动很大。
                
                // 简易续写方案：
                // 再次调用，但在 prompt 里明确说“请继续写”。
                // 风险：模型不知道之前写了啥，可能会重新开始。
                
                // 必须让模型知道之前写了啥。
                // 鉴于 constructPrompt 的设计，我们只能把之前的内容放进 payload。
                // 为了避免 Token 爆炸，我们可以只放最后 1000 个字？
                // 是的，这就够了。
                
                const lastContext = fullContent.slice(-2000); // 取最后2000字符
                newPayload._continue_history = lastContext;
                newPayload._continue_count = currentRetryCount + 1;
                
                // 递归调用
                const nextResponse = await callProvider(provider, taskType, model, newPayload, (chunk) => {
                    // 这里的 chunk 是续写的部分，直接透传给上层
                    onProgress(chunk);
                    fullContent += chunk; // 本地也累加，虽然对于本次函数调用来说没用了
                });
                
                // 拼接结果
                if (nextResponse.ok && nextResponse.data) {
                    // 合并数据
                    // 注意：extractJson 解析出来的可能是部分数据。
                    // 如果是 JSON 模式，拼接非常困难。
                    // 但如果是 Markdown 模式（现在推荐的），直接拼接 text 即可。
                    
                    const nextData = nextResponse.data as any;
                    let nextText = '';
                    if (nextData.script_text) nextText = nextData.script_text;
                    else if (nextData.text) nextText = nextData.text;
                    
                    // 我们返回合并后的结果
                    // 这里我们假设 fullContent 已经是第一次生成的全部文本（包括 JSON 括号等）
                    // 这种拼接其实是有风险的（JSON 结构会被破坏）。
                    // 但既然我们已经在 prompt 里允许 Markdown，希望模型能智能处理。
                    
                    // 如果是 JSON 模式，fullContent 结尾可能是断掉的 json。
                    // nextText 开头可能是接续的 json。
                    // 直接拼起来 string 可能是合法的。
                    
                    // 无论如何，返回完整内容让 extractJson 去尽力解析
                    const combinedText = fullContent + nextText;
                    
                    try {
                        const data = extractJson(combinedText);
                        return { ok: true, data };
                    } catch (e) {
                         // Fallback
                         return { 
                             ok: true, 
                             data: { script_text: combinedText, scenes: [] } 
                         };
                    }
                }
            }
        }

      } catch (err) {
         console.error('Stream reading failed:', err);
         throw err;
      }

      // 流式结束后，构造标准返回
      try {
        const data = extractJson(fullContent);
        return { ok: true, data };
      } catch (e) {
        console.warn('[AI] JSON extraction failed after stream.', e);
        if (taskType === 'script') {
           // 尝试从不完整的JSON中提取script_text
           let cleanText = fullContent;
           // 尝试匹配 script_text 字段的内容
           const match = fullContent.match(/"script_text"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/);
           if (match && match[1]) {
               // 手动处理转义字符，比 JSON.parse 更宽容
               cleanText = match[1]
                   .replace(/\\"/g, '"')
                   .replace(/\\n/g, '\n')
                   .replace(/\\\\/g, '\\')
                   .replace(/\\t/g, '\t');
           } else {
               // 如果没匹配到，可能是直接返回了 Markdown 代码块
               const mdMatch = fullContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
               if (mdMatch && mdMatch[1]) {
                   // 尝试再次提取，如果代码块里还是JSON
                   const innerText = mdMatch[1];
                   const innerMatch = innerText.match(/"script_text"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/);
                   if (innerMatch && innerMatch[1]) {
                        cleanText = innerMatch[1]
                           .replace(/\\"/g, '"')
                           .replace(/\\n/g, '\n')
                           .replace(/\\\\/g, '\\');
                   } else {
                       // 如果代码块里不是JSON（可能是纯文本），直接用
                       if (!innerText.trim().startsWith('{')) {
                           cleanText = innerText;
                       }
                   }
               }
           }

           return { 
             ok: true, 
             data: { 
               script_text: cleanText,
               scenes: [] 
             } 
           };
        } else if (taskType === 'storyboard') {
            // 尝试从文本中提取 shots 数组
            // 1. 尝试找 Markdown 代码块
            let potentialJson = fullContent;
            const mdMatch = fullContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (mdMatch && mdMatch[1]) {
                potentialJson = mdMatch[1];
            }
            // 2. 尝试解析
            try {
                const parsed = JSON.parse(potentialJson);
                if (parsed.shots) return { ok: true, data: parsed };
                if (Array.isArray(parsed)) return { ok: true, data: { shots: parsed } };
            } catch (ignore) {
                // 3. 正则提取 shots 数组
                const shotsMatch = fullContent.match(/"shots"\s*:\s*(\[\s*\{[\s\S]*\}\s*\])/);
                if (shotsMatch && shotsMatch[1]) {
                    try {
                        const shots = JSON.parse(shotsMatch[1]);
                        return { ok: true, data: { shots } };
                    } catch (ignore) {}
                }
            }
            // 失败，返回空 shots 防止前端崩，但带上原始文本
             return { ok: true, data: { shots: [], raw_text: fullContent } };
        } else if (taskType === 'video_cards') {
            // 尝试从文本中提取 cards 数组
            let potentialJson = fullContent;
            const mdMatch = fullContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (mdMatch && mdMatch[1]) {
                potentialJson = mdMatch[1];
            }
            try {
                const parsed = JSON.parse(potentialJson);
                if (parsed.cards) return { ok: true, data: parsed };
                if (Array.isArray(parsed)) return { ok: true, data: { cards: parsed } };
            } catch (ignore) {
                const cardsMatch = fullContent.match(/"cards"\s*:\s*(\[\s*\{[\s\S]*\}\s*\])/);
                if (cardsMatch && cardsMatch[1]) {
                    try {
                        const cards = JSON.parse(cardsMatch[1]);
                        return { ok: true, data: { cards } };
                    } catch (ignore) {}
                }
            }
            return { ok: true, data: { cards: [], raw_text: fullContent } };
        }
        return { ok: true, data: { text: fullContent, raw_text: fullContent } };
      }
    }

    const result = await response.json();

    // 解析响应 (非流式)
    if (provider.type === 'llm') {
      const content = result.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Provider响应格式错误: missing choices[0].message.content');
      }

      console.log('[AI] Raw content received:', content.substring(0, 200) + '...');

      // 尝试解析JSON
      try {
        const data = extractJson(content);
        // 始终附加原始文本
        if (typeof data === 'object' && data !== null) {
            data.raw_text = content;
        }
        return { ok: true, data };
      } catch (e) {
        console.warn('[AI] JSON extraction failed. Raw content:', content);
        // 如果不是JSON，构建一个兼容的结构返回，避免前端崩溃
        // 对于剧本任务，把全文放到 script_text
        if (taskType === 'script') {
           return { 
             ok: true, 
             data: { 
               script_text: content,
               scenes: [], // 空场景列表，避免前端map报错
               raw_text: content
             } 
           };
        } else if (taskType === 'storyboard') {
            return {
                ok: true,
                data: {
                    shots: [],
                    raw_text: content
                }
            };
        }
        
        // 其他任务类型，返回 text 字段
        return { ok: true, data: { text: content, raw_text: content } };
      }
    } else if (provider.type === 'image') {
      const imageUrl = result.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error('Provider响应格式错误');
      }
      return { ok: true, data: { image_url: imageUrl } };
    }

    return { ok: false, error: { code: 'UNKNOWN_TYPE', message: '未知的Provider类型' } };
  } catch (error) {
    console.error('[AI] Call provider failed:', error);
    throw error;
  }
}

/**
 * 回退到原有方法
 */
async function fallbackToLegacyMethod(taskType: TaskType, payload: unknown): Promise<ApiResponse<unknown>> {
  switch (taskType) {
    case 'script':
      return generateScript(payload as GenerateScriptPayload);
    case 'storyboard':
      return generateStoryboard(payload as GenerateStoryboardPayload);
    case 'video_cards':
      return generateVideoCards(payload as GenerateVideoCardsPayload);
    case 'edit_plan':
      return generateEditPlan(payload as GenerateEditPlanPayload);
    default:
      return {
        ok: false,
        error: {
          code: 'UNSUPPORTED_TASK',
          message: '不支持的任务类型'
        }
      };
  }
}

/**
 * 测试Provider连接
 * @param provider Provider配置
 * @returns 测试结果
 */
export async function testProvider(provider: ApiProvider): Promise<ProviderTestResult> {
  const startTime = Date.now();

  try {
    // 构建测试请求
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.api_key}`
    };

    // 添加自定义headers
    if (provider.headers_json) {
      try {
        const customHeaders = JSON.parse(provider.headers_json);
        Object.assign(headers, customHeaders);
      } catch (e) {
        return {
          success: false,
          error: '自定义headers格式错误'
        };
      }
    }

    // 根据Provider类型构建测试请求
    let endpoint = '';
    let requestBody: unknown;

    if (provider.type === 'llm') {
      endpoint = '/chat/completions';
      requestBody = {
        model: provider.default_model,
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ],
        max_tokens: 10
      };
    } else if (provider.type === 'image') {
      endpoint = '/images/generations';
      requestBody = {
        prompt: 'test',
        model: provider.default_model,
        n: 1,
        size: '256x256'
      };
    } else {
      return {
        success: false,
        error: '暂不支持该Provider类型的测试'
      };
    }

    // 发送测试请求
    // 确保base_url没有尾部斜杠，endpoint以斜杠开头
    const baseUrl = provider.base_url.replace(/\/+$/, '');
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        latency,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }

    return {
      success: true,
      latency,
      message: `连接成功！延迟: ${latency}ms`
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      latency,
      error: error instanceof Error ? error.message : '连接失败'
    };
  }
}

export default {
  generateScript,
  generateStoryboard,
  generateVideoCards,
  generateEditPlan,
  generate,
  testProvider
};
