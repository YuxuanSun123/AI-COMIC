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
  characters?: Array<{
    name: string;
    traits: string;
    relation: string;
    appearance: string;
    experience: string;
  }>;
  raw_text?: string;
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
    characters?: Array<{
      name: string;
      traits: string;
      relation: string;
      appearance: string;
      experience: string;
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
  characters?: Array<{
    name: string;
    traits: string;
    relation: string;
    appearance?: string;
    experience?: string;
  }>;
}

export interface ImageGenerationResult {
  image_url: string;
  raw_text?: string;
  warning?: string;
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
        const targetType = (taskType === 'image_storyboard' || taskType === 'image_shot' || taskType === 'image_generation') ? 'image' : 'llm';
        
        // Debugging log to see available providers
        // console.log('[AI] Searching for provider type:', targetType, 'Available:', providers.map(p => `${p.name}(${p.type}, ${p.enabled})`));
        
        // Loosen the check: look for type match OR 'image' in name if we are looking for image provider
        const availableProvider = providers.find(p => {
             if (!p.enabled) return false;
             if (p.type === targetType) return true;
             // If type is not strictly set but we want image, check name/id/default_model
             if (targetType === 'image' && (
                 p.id.toLowerCase().includes('image') || 
                 p.name.toLowerCase().includes('image') ||
                 p.default_model?.includes('dall-e') ||
                 p.default_model?.includes('imagen') ||
                 p.default_model?.includes('stable-diffusion')
             )) return true;
             return false;
        });
        
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
       // Even if not explicitly configured in routing, we should try to auto-detect a provider
       // This handles cases where new task types (like image_generation) are added but user config is old
       if (providersConfig) {
           const providers: ApiProvider[] = JSON.parse(providersConfig);
           const targetType = (taskType === 'image_storyboard' || taskType === 'image_shot' || taskType === 'image_generation') ? 'image' : 'llm';
           
           const autoProvider = providers.find(p => {
             if (!p.enabled) return false;
             if (p.type === targetType) return true;
             if (p.type.toLowerCase() === targetType) return true;
             if (targetType === 'image' && (
                 p.id.toLowerCase().includes('image') || 
                 p.name.toLowerCase().includes('image') ||
                 p.default_model?.includes('dall-e') ||
                 p.default_model?.includes('imagen') ||
                 p.default_model?.includes('stable-diffusion') ||
                 p.default_model?.includes('gemini-2.0')
             )) return true;
             return false;
           });

           if (autoProvider) {
              console.log(`[AI] Missing routing for ${taskType}, auto-switching to: ${autoProvider.name}`);
              return callProvider(autoProvider, taskType, autoProvider.default_model, payload, onProgress);
           }
       }
       
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
      const targetType = (taskType === 'image_storyboard' || taskType === 'image_shot' || taskType === 'image_generation') ? 'image' : 'llm';
      const autoProvider = providers.find(p => {
         if (!p.enabled) return false;
         if (p.type === targetType) return true;
         // Case-insensitive check for type
         if (p.type.toLowerCase() === targetType) return true;
         // Loose check for name/id/model
         if (targetType === 'image' && (
             p.id.toLowerCase().includes('image') || 
             p.name.toLowerCase().includes('image') ||
             p.default_model?.includes('dall-e') ||
             p.default_model?.includes('imagen') ||
             p.default_model?.includes('stable-diffusion')
         )) return true;
         return false;
      });

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
      
任务：根据输入的剧本或文本生成分镜列表，并提取全剧出现的角色信息。

要求：
1. 根据 params.shot_density (镜头密度) 决定分镜数量。
2. 包含画面描述(frame)、动作(action)、运镜(camera)和对白(dialogue)。
3. 提取剧本中出现的所有角色，包含名字、性格(traits)、外貌(appearance)、经历(experience)和关系(relation)。

输出JSON格式示例：
{
  "characters": [
    { "name": "张三", "traits": "勇敢，冲动", "appearance": "高大，短发", "experience": "退役军人", "relation": "主角" }
  ],
  "shots": [
    { "shot_no": 1, "scene_ref": 1, "frame": "...", "action": "...", "camera": "...", "dialogue": "...", "duration_sec": 3, "notes": "..." }
  ]
}
`,
      user: JSON.stringify(payload)
    };
  } else if (taskType === 'video_cards') {
    return {
      system: `${baseSystem}
      
任务：根据分镜列表生成视频生成所需的提示词(Prompt)，并提取全片出现的关键角色信息。

要求：
1. 为每个镜头生成详细的英文提示词(prompt)和负向提示词(negative_prompt)。
2. 保持角色特征的一致性。
3. **提取角色信息**：分析所有分镜，提取出所有出现的关键角色（exclude "NPC" or "crowd" unless important）。
   - 为每个角色生成性格特征 (traits)。
   - 生成详细的外貌描述 (appearance)，最好是英文提示词格式，用于后续保持角色一致性。
   - 确定角色在剧中的身份/关系 (relation)。
4. **返回格式**：
   必须包含 "cards" 字段（镜头卡数组）和 "characters" 字段（角色数组）。
   - cards: [{ "card_no", "shot_ref", "visual_desc", "character_action", "lighting_mood", "camera_desc", "dialogue_voiceover", "prompt", "negative_prompt", "notes" }]
   - characters: [{ "name", "traits", "relation", "appearance", "experience" }]
`,
      user: JSON.stringify(payload)
    };
  } else if (taskType === 'edit_plan') {
    return {
      system: `${baseSystem}
      
任务：根据镜头卡生成分镜清单。

要求：
1. 为每个镜头卡生成对应的分镜条目。
2. 字段说明：
   - item_no: 序号
   - shot_ref: 对应镜头卡编号
   - duration_sec: 建议时长（秒），默认4秒
   - transition: 转场方式，默认"cut"
   - voice_sfx: 音效/配音备注
   - caption_subtitle: 字幕内容
   - asset_need: 画面素材需求（从visual_desc和character_action提取）
   - notes: 备注
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
      const promptText = typeof payload === 'string' ? payload : (payload as any).prompt || JSON.stringify(payload);
      // Note: The public API for Imagen on AI Studio might differ. 
      // Assuming /v1beta/models/{model}:predict or similar. 
      // Current AI Studio docs suggest standard GenerateContent works for some multimodal, but Imagen specific endpoint is safer if known.
      // However, for "AQ..." keys (AI Studio), standard Imagen might not be fully exposed via the same endpoint as Vertex.
      // Fallback: Use the text generation endpoint but with image prompt structure if supported, 
      // OR simulate response if we can't hit the real image API yet.
      
      // Google AI Studio (API Key) typically uses generateContent even for some image capabilities,
      // OR specific Imagen endpoints. However, 'predict' is strictly Vertex AI (OAuth).
      // Since we have an API Key (starts with AQ...), we are on AI Studio.
      // We should try 'generateContent' which is the unified endpoint.
      
      const url = `${baseUrl}/models/${targetModel}:predict?key=${apiKey}`;
      // const url = `${baseUrl}/models/${targetModel}:generateContent?key=${apiKey}`; // Alternative if predict fails
      
      console.log(`[AI] Calling Google Image Provider: ${url}`);
      
      // Construct payload for Imagen via Predict (Vertex style)
      let requestBody: any = {
          instances: [{ prompt: promptText }],
          parameters: { sampleCount: 1, aspectRatio: "3:4" }
      };

      try {
        let response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        // 401/403/404 handling: Try generateContent fallback
        if (!response.ok && (response.status === 401 || response.status === 404 || response.status === 400)) {
             console.warn(`[AI] Predict endpoint failed (${response.status}), switching to generateContent...`);
             
             // Keep the same model, just switch endpoint/protocol
             // NOTE: gemini-1.5-flash cannot generate images, so we must stick to imagen models or fail.
             // If imagen-3.0 fails on generateContent too, then the user likely lacks access.
             const fallbackModel = targetModel; 
             
             // Ensure we use AI Studio URL for fallback
             const fallbackBase = provider.base_url.includes('generativelanguage') ? baseUrl : 'https://generativelanguage.googleapis.com/v1beta';

             const genContentUrl = `${fallbackBase}/models/${fallbackModel}:generateContent?key=${apiKey}`;
             
             // Construct standard generateContent body as per Google docs
             // For Gemini models generating images, we must specify response_modalities
             const genContentBody: any = {
                 contents: [{ parts: [{ text: promptText }] }]
             };

             if (targetModel.includes('gemini')) {
                 // Gemini Image Generation Config
                 genContentBody.generationConfig = {
                     responseModalities: ["IMAGE"], // Force image output
                     candidateCount: 1
                 };
             } else {
                 // Imagen via generateContent
                 // Do NOT set responseMimeType to "image/jpeg" as it triggers validation error (only text/json allowed there)
                 // Imagen should produce image by default or via specific params if supported
                 genContentBody.generationConfig = {
                     candidateCount: 1
                 };
             }
             
             const fbResponse = await fetch(genContentUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(genContentBody)
             });
             
             if (fbResponse.ok) {
                 response = fbResponse; // Use this response
             } else {
                 const errText = await fbResponse.text();
                 // Return a clear error if both fail
                 throw new Error(`Google Image API Error: Predict failed (${response.status}), generateContent failed (${fbResponse.status}) - ${errText}`);
             }
        } else if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google Image API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // 1. Try Vertex 'predict' format
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded || data.predictions?.[0]?.bytes;
        if (base64Image) {
            return { ok: true, data: { image_url: `data:image/png;base64,${base64Image}` } };
        }
        
        // 2. Try Gemini 'generateContent' format (inline data)
        // Structure: candidates[0].content.parts[0].inlineData.data
        const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;
        if (inlineData) {
             const mimeType = data.candidates?.[0]?.content?.parts?.[0]?.inline_data?.mime_type || 'image/png';
             return { ok: true, data: { image_url: `data:${mimeType};base64,${inlineData}` } };
        }

        // 3. Try Gemini 'generateContent' text format (if it returned a link or text)
        const textPart = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textPart) {
             // Sometimes it might return a text description if image gen failed silently
             console.warn('[AI] Received text instead of image:', textPart);
             // Attempt to extract URL if present
             const urlMatch = textPart.match(/https?:\/\/[^\s"']+/);
             if (urlMatch) {
                 return { ok: true, data: { image_url: urlMatch[0] } };
             }
        }

        console.warn('[AI] Unknown Google Response format:', data);
        return { ok: true, data: data }; // Return raw data, might fail downstream but better than crash
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
    // 强制使用正确的端点逻辑：
    // 1. generativelanguage.googleapis.com (AI Studio) -> generateContent (Gemini 2.0+ for images)
    // 2. aiplatform.googleapis.com (Vertex AI) -> predict (Imagen)
    
    const isAIStudio = provider.base_url.includes('generativelanguage.googleapis.com');
    
    // 如果是 Vertex AI (aiplatform.googleapis.com)
    // 需要: Project ID, Location, Access Token (in api_key field or Bearer)
    // URL Pattern: https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:predict
    if (!isAIStudio) {
        let projectId = '';
        let location = 'us-central1';
        
        // 尝试从 headers_json 获取 Project/Location 配置
        if (provider.headers_json) {
            try {
                const conf = JSON.parse(provider.headers_json);
                if (conf.project_id) projectId = conf.project_id;
                if (conf.location) location = conf.location;
            } catch (e) {
                // ignore
            }
        }
        
        // 如果没有配置 Project ID，尝试从 API Key (如果是 Access Token 无法提取，但如果是 JSON Key 可能...)
        // 这里假设用户必须在配置里提供 Project ID。如果没有，报错提示。
        if (!projectId) {
             throw new Error("Vertex AI requires 'project_id' configured in Provider Headers JSON (e.g. {\"project_id\": \"my-project\", \"location\": \"us-central1\"})");
        }

        const targetModel = model || provider.default_model || 'imagen-3.0-generate-001';
        const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${targetModel}:predict`;
        
        console.log(`[AI] Calling Google Vertex AI (Imagen): ${url}`);
        
        // Imagen 请求体构建
        const promptText = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const requestBody = {
            instances: [
                { prompt: promptText }
            ],
            parameters: {
                sampleCount: 1,
                // aspectRatio: "1:1" // 可选
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${provider.api_key}` // 假设 api_key 字段填的是 Access Token
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Vertex AI Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            
            // 解析 Imagen 响应
            // { predictions: [ { bytesBase64Encoded: "..." } ] }
            const b64Image = data.predictions?.[0]?.bytesBase64Encoded;
            if (b64Image) {
                 const mimeType = data.predictions?.[0]?.mimeType || 'image/png';
                 return { ok: true, data: { image_url: `data:${mimeType};base64,${b64Image}` } };
            }
            
            throw new Error('Vertex AI response format not recognized (no bytesBase64Encoded)');
            
        } catch (e) {
            console.error('[AI] Vertex AI Error:', e);
            throw e;
        }
    }

    // 如果是 AI Studio (API Key)
    if (isAIStudio) {
         let targetModel = model || provider.default_model || 'gemini-2.0-flash-exp';
         
         // 策略调整：AI Studio 的 API Key 无法直接调用 Imagen 模型。
         // 必须切换到 Gemini 2.0 Flash (Preview) 使用原生画图能力。
         if (targetModel.includes('imagen')) {
              console.warn(`[AI] Model '${targetModel}' may not be supported. Switching to 'gemini-2.0-flash-exp'.`);
              targetModel = 'gemini-2.0-flash-exp';
         }

         // 强制修正：如果任务是生成图片，且模型被设为 gemini-2.0-flash (非exp)，强制切换到 exp 版本
        // 因为标准版 flash 目前不支持画图或返回空数据。
        /* 
        if ((taskType === 'image_generation' || provider.type === 'image') && targetModel === 'gemini-2.0-flash') {
            console.warn(`[AI] Standard 'gemini-2.0-flash' detected for image generation. Switching to 'gemini-2.0-flash-exp' for multimodal capability.`);
            targetModel = 'gemini-2.0-flash-exp';
        }
        */

        // 临时修复：处理用户本地缓存了错误的 "gemini-2.0-flash-exp" + "v1alpha" 配置导致的 404 问题
        if (targetModel === 'gemini-2.0-flash-exp') {
             console.warn(`[AI] Deprecated model 'gemini-2.0-flash-exp' detected. Auto-switching to 'gemini-2.0-flash'.`);
             targetModel = 'gemini-2.0-flash';
        }

        // 强制使用 v1alpha 以支持实验性功能（如画图）如果 v1beta 失败
        // 但通常我们应该尊重配置。这里做一个智能替换：如果是 gemini-2.0 且是 v1beta，尝试替换为 v1alpha
        /*
        let baseUrl = provider.base_url.replace(/\/+$/, '');
        if (targetModel.includes('gemini-2.0') && baseUrl.includes('v1beta')) {
            baseUrl = baseUrl.replace('v1beta', 'v1alpha');
        }
        */
        let baseUrl = provider.base_url.replace(/\/+$/, '');
        
        // 临时修复：强制将 v1alpha 修正回 v1beta (因为 gemini-2.0-flash 在 v1alpha 下报 404)
        if (baseUrl.includes('v1alpha')) {
            console.warn(`[AI] Deprecated API version 'v1alpha' detected. Auto-switching to 'v1beta'.`);
            baseUrl = baseUrl.replace('v1alpha', 'v1beta');
        }
        
        const url = `${baseUrl}/models/${targetModel}:generateContent?key=${provider.api_key}`;
         
         console.log(`[AI] Calling Google AI Studio (generateContent): ${url}`);
         
         // 构建标准的 Gemini generateContent 请求
        const promptText = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const requestBody: any = {
            contents: [{ parts: [{ text: promptText }] }]
        };

        // Gemini 2.0 Native Image Generation
        // 注意：responseModalities: ["IMAGE"] 在部分账号/Key下可能导致 400 Invalid Argument
        // 如果我们遇到 400，只能退回到 Prompt 引导模式。
        // 目前为了稳定性，我们先默认不加这个参数，完全依赖 Prompt 引导。
        if (targetModel.includes('gemini-2.0') && (taskType === 'image_generation' || provider.type === 'image')) {
            /*
            requestBody.generationConfig = {
                responseModalities: ["IMAGE"]
            };
            */
            // 修改：允许模型返回文本描述，而不是强制仅返回图片。
            // 这样如果模型无法生成图片（如当前Key不支持），它会解释原因，而不是返回空响应。
            requestBody.contents[0].parts[0].text = `Please generate an image of: ${promptText}. If you cannot generate an image directly, please describe it in detail.`;
        } else {
            // 旧逻辑备份...
        }
         
         try {
             const response = await fetch(url, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(requestBody)
             });
             
             if (!response.ok) {
                 const errorText = await response.text();
                 
                 // Diagnostic: Check API Key format
                 if ((response.status === 401 || response.status === 403) && !provider.api_key.startsWith('AIza')) {
                     console.warn('[AI] Potential API Key format issue detected (should start with AIza)');
                     throw new Error(`Google API Error ${response.status}: Key format invalid? (Must start with AIza) - ${errorText}`);
                 }

                 throw new Error(`Google API Error ${response.status}: ${errorText}`);
             }
             
             const data = await response.json();
             
             // 解析返回数据 (Gemini format)
             // 1. Inline Data (Base64) - Gemini 2.0 画图通常返回这个
             const inlineData = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data)?.inline_data?.data;
             if (inlineData) {
                  const mimeType = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data)?.inline_data?.mime_type || 'image/png';
                  return { ok: true, data: { image_url: `data:${mimeType};base64,${inlineData}` } };
             }
             
             // 2. Text (URL or Description)
             const textPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
             if (textPart) {
                 // 检查是否包含 http 链接
                 const urlMatch = textPart.match(/https?:\/\/[^\s"']+/);
                 if (urlMatch) {
                     return { ok: true, data: { image_url: urlMatch[0] } };
                 }
                 // 如果只是文本，可能生成失败了，但也返回回去
                 console.warn('[AI] Gemini returned text instead of image:', textPart);
                 return { ok: true, data: { image_url: '', raw_text: textPart } };
             }
             
             // 3. Safety Block or Empty Response
             if (!data.candidates?.[0]?.content?.parts) {
                 // Check PromptFeedback (Request blocked entirely)
                 if (data.promptFeedback) {
                     const blockReason = data.promptFeedback.blockReason;
                     if (blockReason) {
                         let msg = `AI Blocked Request (Reason: ${blockReason})`;
                         if (data.promptFeedback.safetyRatings) {
                             const ratings = data.promptFeedback.safetyRatings
                                 .filter((r: any) => r.probability !== 'NEGLIGIBLE')
                                 .map((r: any) => `${r.category}: ${r.probability}`)
                                 .join(', ');
                             if (ratings) msg += ` - Ratings: ${ratings}`;
                         }
                         return { ok: true, data: { image_url: '', raw_text: msg } };
                     }
                 }

                 // Check Candidate FinishReason
                 const finishReason = data.candidates?.[0]?.finishReason;
                 const safetyRatings = data.candidates?.[0]?.safetyRatings;
                 
                 if (finishReason) {
                     let refusalMsg = `AI Refusal (FinishReason: ${finishReason})`;
                     if (safetyRatings) {
                         const blockedCategories = safetyRatings
                             .filter((r: any) => r.probability !== 'NEGLIGIBLE')
                             .map((r: any) => `${r.category}: ${r.probability}`)
                             .join(', ');
                         if (blockedCategories) {
                             refusalMsg += ` - Blocked Categories: ${blockedCategories}`;
                         }
                     }
                     // Return as raw_text so UI can display it
                     return { ok: true, data: { image_url: '', raw_text: refusalMsg } };
                 }
                 
                 // Fallback for completely empty unknown response - Serialize data for debugging
                 console.warn('[AI] Gemini returned empty response structure:', data);
                 const debugInfo = JSON.stringify(data).substring(0, 200); // Truncate to avoid too long msg
                 return { ok: false, error: { message: `Empty response from AI (Debug: ${debugInfo})`, code: 'EmptyResponse' } };
             }
             
             return { ok: true, data: data };
             
         } catch (e) {
             console.error('[AI] Google AI Studio Error:', e);
             throw e;
         }
    }
    
    // 如果不是 AI Studio (即 Vertex AI)，则继续使用之前的 callGoogleProvider 逻辑 (它会处理 predict)
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
    // Aliyun DashScope Qwen-Image Specific Logic
    if (provider.id === 'provider_aliyun_wanx' || provider.base_url.includes('multimodal-generation')) {
        endpoint = ''; // Base URL is already the full endpoint
        
        let promptText = '';
        let negativePrompt = '';
        let size = '1024*1024';
        
        if (typeof payload === 'string') {
            promptText = payload;
        } else if (typeof payload === 'object' && payload !== null) {
            const p = payload as any;
            promptText = p.prompt || JSON.stringify(payload);
            if (p.negative_prompt) negativePrompt = p.negative_prompt;
            if (p.size) size = p.size;
        }

        requestBody = {
            model: model || provider.default_model || 'qwen-image-max',
            input: {
                messages: [{
                    role: 'user',
                    content: [{ text: promptText }]
                }]
            },
            parameters: {
                size: size,
                n: 1
                // prompt_extend: true,
                // watermark: false
            }
        };

        if (negativePrompt) {
            requestBody.parameters.negative_prompt = negativePrompt;
        }
    } else {
        // Standard OpenAI Compatible Image Generation
        endpoint = '/images/generations';
        const promptContent = typeof payload === 'string' ? payload : JSON.stringify(payload);
        requestBody = {
            prompt: promptContent,
            model: model || provider.default_model,
            n: 1,
            size: '1024x1024'
        };
    }
  }

  // 确保base_url没有尾部斜杠
  const baseUrl = provider.base_url.replace(/\/+$/, '');
  let url = `${baseUrl}${endpoint}`;

  // CORS Proxy for DashScope (Aliyun) in Browser Environment
  if (typeof window !== 'undefined' && url.includes('dashscope.aliyuncs.com')) {
      url = url.replace('https://dashscope.aliyuncs.com', '/dashscope-api');
      console.log(`[AI] Using Proxy URL: ${url}`);
  }

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
        
        // 针对 storyboard 类型的特殊处理：如果返回了 storyboard 字段但没有 shots 字段
        if (taskType === 'storyboard' && data.storyboard && !data.shots && Array.isArray(data.storyboard)) {
            data.shots = data.storyboard;
        }

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
                if (parsed.storyboard && Array.isArray(parsed.storyboard)) {
                    return { ok: true, data: { ...parsed, shots: parsed.storyboard } };
                }
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
                // 兼容 prompts 字段
                if (parsed.prompts) return { ok: true, data: { cards: parsed.prompts } };
                if (Array.isArray(parsed)) return { ok: true, data: { cards: parsed } };
            } catch (ignore) {
                // 尝试修复后解析
                try {
                    const parsed = JSON.parse(repairJson(potentialJson));
                    if (parsed.cards) return { ok: true, data: parsed };
                    if (parsed.prompts) return { ok: true, data: { cards: parsed.prompts } };
                    if (Array.isArray(parsed)) return { ok: true, data: { cards: parsed } };
                } catch (ignore_repair) {}

                // 尝试正则提取 cards
                const cardsMatch = fullContent.match(/"cards"\s*:\s*(\[\s*\{[\s\S]*\}\s*\])/);
                if (cardsMatch && cardsMatch[1]) {
                    try {
                        const cards = JSON.parse(cardsMatch[1]);
                        return { ok: true, data: { cards } };
                    } catch (ignore) {
                        // 尝试修复后解析
                        try {
                            const cards = JSON.parse(repairJson(cardsMatch[1]));
                            return { ok: true, data: { cards } };
                        } catch (ignore_repair) {}
                    }
                }
                
                // 尝试正则提取 prompts
                const promptsMatch = fullContent.match(/"prompts"\s*:\s*(\[\s*\{[\s\S]*\}\s*\])/);
                if (promptsMatch && promptsMatch[1]) {
                    try {
                        const cards = JSON.parse(promptsMatch[1]);
                        return { ok: true, data: { cards } };
                    } catch (ignore) {
                        // 尝试修复后解析
                        try {
                            const cards = JSON.parse(repairJson(promptsMatch[1]));
                            return { ok: true, data: { cards } };
                        } catch (ignore_repair) {}
                    }
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

            // 针对 storyboard 类型的特殊处理
            if (taskType === 'storyboard' && data.storyboard && !data.shots && Array.isArray(data.storyboard)) {
                data.shots = data.storyboard;
            }
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
      // Check for Aliyun DashScope response structure
      // { output: { results: [ { url: ... } ] } }
      // Or { output: { choices: [ { message: { content: [ { image: ... } ] } } ] } }
      const aliyunUrl = (result as any).output?.results?.[0]?.url || 
                        (result as any).output?.choices?.[0]?.message?.content?.[0]?.image;
      
      if (aliyunUrl) {
           return { ok: true, data: { image_url: aliyunUrl } };
      }

      // Debugging: If output exists but URL extraction failed
      if ((result as any).output) {
           console.warn('[AI] Aliyun response missing URL. Output:', JSON.stringify((result as any).output));
      }

      const imageUrl = result.data?.[0]?.url;
      if (!imageUrl) {
        console.error('[AI] Provider Response Structure Mismatch:', JSON.stringify(result, null, 2));
        throw new Error(`Provider响应格式错误 (No URL found). Response: ${JSON.stringify(result).substring(0, 200)}...`);
      }
      return { ok: true, data: { image_url: imageUrl } };
    }

    return { ok: false, error: { code: 'UNKNOWN_TYPE', message: '未知的Provider类型' } };
  } catch (error) {
    console.error('[AI] Call provider failed:', error);
    
    // Auto-fallback for image generation if the configured provider fails
    if (taskType === 'image_generation') {
        // console.warn('⚠️ Automatically switching to Pollinations fallback due to provider failure.');
        // return fallbackToLegacyMethod(taskType, payload);
        
        // 暂时禁用自动回退，以便用户能看到真实的报错信息 (如 403 Forbidden 或 CORS 错误)
        console.warn('⚠️ Image Generation failed. Fallback is disabled to debug error.');
        throw error;
    }

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
    case 'image_generation':
            console.warn('⚠️ Primary Image Provider failed. Falling back to Pollinations.ai (Mock/Free Tier).');
            // Fallback for generic image generation (using Pollinations)
            // This is used when no real API provider is available or configured
            const prompt = payload as string;
            // Limit prompt length to avoid URI too long errors
            const safePrompt = prompt.substring(0, 500); 
            const encodedPrompt = encodeURIComponent(safePrompt);
            const seed = Math.floor(Math.random() * 100000);
            // Pollinations.ai URL format
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true&model=flux`;
            
            return { 
                ok: true, 
                data: { 
                    image_url: imageUrl,
                    // Add a warning note so the UI/User knows this is a fallback
                    warning: 'Using Pollinations.ai fallback (Primary API failed)'
                } 
            };
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
      if (provider.id === 'provider_aliyun_wanx' || provider.base_url.includes('multimodal-generation')) {
          endpoint = '';
          requestBody = {
              model: provider.default_model || 'qwen-image-max',
              input: {
                  messages: [{
                      role: 'user',
                      content: [{ text: 'A cute cat' }]
                  }]
              },
              parameters: {
                  size: '1024*1024',
                  n: 1
              }
          };
      } else {
          endpoint = '/images/generations';
          requestBody = {
            prompt: 'test',
            model: provider.default_model,
            n: 1,
            size: '256x256'
          };
      }
    } else {
      return {
        success: false,
        error: '暂不支持该Provider类型的测试'
      };
    }

    // 发送测试请求
    // 确保base_url没有尾部斜杠，endpoint以斜杠开头
    const baseUrl = provider.base_url.replace(/\/+$/, '');
    
    // Special handling for Google Gemini/Vertex/Imagen
    if (provider.base_url.includes('googleapis.com')) {
        let googleUrl = '';
        let googleBody: any = {};
        const isAIStudio = provider.base_url.includes('generativelanguage.googleapis.com');
        
        if (provider.type === 'image') {
             if (isAIStudio) {
                 // Force generateContent for AI Studio Image
                let targetModel = provider.default_model || 'gemini-2.0-flash';
                
                // 自动修正：AI Studio + Imagen -> Gemini 2.0
                if (targetModel.includes('imagen') || targetModel.includes('gemini-2.0-flash-exp')) {
                    targetModel = 'gemini-2.0-flash';
                }

                // 智能切换到 v1alpha (如果当前是 v1beta 且目标是 gemini-2.0)
                let finalBaseUrl = baseUrl;
                if (targetModel.includes('gemini-2.0') && finalBaseUrl.includes('v1beta')) {
                    finalBaseUrl = finalBaseUrl.replace('v1beta', 'v1alpha');
                }

                googleUrl = `${finalBaseUrl}/models/${targetModel}:generateContent?key=${provider.api_key}`;
                googleBody = {
                    contents: [{ parts: [{ text: "Generate an image of: test image" }] }]
                };
                // For Gemini 2.0, we rely on prompt to trigger image generation to avoid parameter compatibility issues.
                /*
                if (targetModel.includes('gemini-2.0')) {
                    googleBody.generationConfig = { responseModalities: ["IMAGE"] };
                }
                */
             } else {
                 // Vertex AI
                 const targetModel = provider.default_model || 'imagen-3.0-generate-001';
                 googleUrl = `${baseUrl}/models/${targetModel}:predict?key=${provider.api_key}`;
                 googleBody = {
                      instances: [{ prompt: "test image" }],
                      parameters: { sampleCount: 1 }
                 };
             }
        } else {
             // LLM test
             const targetModel = provider.default_model || 'gemini-1.5-flash';
             googleUrl = `${baseUrl}/models/${targetModel}:generateContent?key=${provider.api_key}`;
             googleBody = {
                 contents: [{ parts: [{ text: "Hello" }] }]
             };
        }
        
        console.log(`[AI] Testing Google Provider: ${googleUrl}`);
        
        let response = await fetch(googleUrl, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(googleBody)
        });
        
        // Retry logic for test (same as main call)
        // If AI Studio imagen-3.0 fails with 404/401/403/400, try generateContent with same model
        if (!response.ok && provider.type === 'image' && (response.status === 404 || response.status === 400 || response.status === 401 || response.status === 403)) {
             console.log(`[AI] Test: Imagen predict failed (${response.status}), switching to generateContent...`);
             
             // Always use AI Studio endpoint for fallback as it supports API Keys best
             // If original was Vertex, we switch to AI Studio base URL
             const fallbackBase = isAIStudio ? baseUrl : 'https://generativelanguage.googleapis.com/v1beta';
             // Keep using the configured model (e.g. imagen-3.0), do NOT downgrade to flash for image tasks
             const targetModel = provider.default_model || 'gemini-2.0-flash';
             const fallbackUrl = `${fallbackBase}/models/${targetModel}:generateContent?key=${provider.api_key}`;
             
             // Reconstruct body to ensure compatibility with generateContent
             const fallbackBody: any = {
                 contents: [{ parts: [{ text: "test image" }] }]
             };

             if (targetModel.includes('gemini')) {
                 fallbackBody.generationConfig = {
                     responseModalities: ["IMAGE"],
                     candidateCount: 1
                 };
             } else {
                 fallbackBody.generationConfig = {
                     // Imagen via generateContent: Do NOT set responseMimeType
                     candidateCount: 1
                 };
             }

             const fbResponse = await fetch(fallbackUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(fallbackBody)
             });
             
             if (fbResponse.ok) {
                 response = fbResponse;
             } else {
                 const fbText = await fbResponse.text();
                 
                 // Diagnosis: Check if API Key format is suspicious
                 let keyWarning = '';
                 if (!provider.api_key.startsWith('AIza')) {
                     keyWarning = ' (注意：您的 API Key 不是以 "AIza" 开头，这可能不是一个有效的 Google AI Studio API Key)';
                 }
                 
                 return { success: false, error: `Google API Error: Primary model failed (${response.status}), Fallback failed (${fbResponse.status}): ${fbText}${keyWarning}` };
             }
        }
        
        if (response.ok) {
             const latency = Date.now() - startTime;
             return { success: true, latency, message: 'Google API连接成功' };
        } else {
             const text = await response.text();
             return { success: false, error: `Google API Error ${response.status}: ${text}` };
        }
    }

    let url = `${baseUrl}${endpoint}`;

    // CORS Proxy for DashScope (Aliyun) in Browser Environment
    if (typeof window !== 'undefined' && url.includes('dashscope.aliyuncs.com')) {
        url = url.replace('https://dashscope.aliyuncs.com', '/dashscope-api');
        console.log(`[AI] Using Proxy URL for Test: ${url}`);
    }

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

/**
 * 通用图片生成
 * @param prompt 提示词
 * @param model (可选) 指定模型
 * @returns 图片URL
 */
export async function generateImage(prompt: string, _model?: string): Promise<ApiResponse<ImageGenerationResult>> {
  return generate('image_generation' as TaskType, prompt) as Promise<ApiResponse<ImageGenerationResult>>;
}

function repairJson(jsonStr: string): string {
  try {
    // 1. Remove trailing commas
    let fixed = jsonStr.replace(/,\s*([\]}])/g, '$1');
    // 2. Fix unquoted keys (simple case)
    fixed = fixed.replace(/([{,]\s*)(\w+):/g, '$1"$2":');
    return fixed;
  } catch (e) {
    return jsonStr;
  }
}

export default {
  generateScript,
  generateStoryboard,
  generateVideoCards,
  generateEditPlan,
  generate,
  generateImage,
  testProvider
};
