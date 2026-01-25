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
 * @returns 生成结果
 */
export async function generate(taskType: TaskType, payload: unknown): Promise<ApiResponse<unknown>> {
  // 读取API路由配置
  const routingConfig = localStorage.getItem('api_routing');
  if (!routingConfig) {
    // 没有配置，回退到原有方法
    return fallbackToLegacyMethod(taskType, payload);
  }

  try {
    const routing = JSON.parse(routingConfig);
    const taskRouting = routing[taskType];

    // 检查是否启用
    if (!taskRouting || !taskRouting.enabled) {
      return fallbackToLegacyMethod(taskType, payload);
    }

    // 读取Provider配置
    const providersConfig = localStorage.getItem('api_providers');
    if (!providersConfig) {
      return fallbackToLegacyMethod(taskType, payload);
    }

    const providers: ApiProvider[] = JSON.parse(providersConfig);
    const provider = providers.find(p => p.id === taskRouting.provider_id && p.enabled);

    if (!provider) {
      // Provider不存在或未启用，尝试fallback
      if (taskRouting.fallback_provider_id) {
        const fallbackProvider = providers.find(p => p.id === taskRouting.fallback_provider_id && p.enabled);
        if (fallbackProvider) {
          return callProvider(fallbackProvider, taskType, taskRouting.model, payload);
        }
      }
      // 没有可用Provider，回退到原有方法
      return fallbackToLegacyMethod(taskType, payload);
    }

    // 调用Provider
    try {
      return await callProvider(provider, taskType, taskRouting.model, payload);
    } catch (error) {
      // 主Provider失败，尝试fallback
      if (taskRouting.fallback_provider_id) {
        const fallbackProvider = providers.find(p => p.id === taskRouting.fallback_provider_id && p.enabled);
        if (fallbackProvider) {
          console.warn(`主Provider失败，尝试fallback: ${fallbackProvider.name}`);
          return await callProvider(fallbackProvider, taskType, taskRouting.model, payload);
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
 * 调用Provider生成内容
 */
async function callProvider(
  provider: ApiProvider,
  taskType: TaskType,
  model: string,
  payload: unknown
): Promise<ApiResponse<unknown>> {
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
  let requestBody: unknown;
  if (provider.type === 'llm') {
    // LLM类型：构建标准的OpenAI格式请求
    requestBody = {
      model: model || provider.default_model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的AI漫剧创作助手。'
        },
        {
          role: 'user',
          content: JSON.stringify(payload)
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    };
  } else if (provider.type === 'image') {
    // Image类型：构建文生图请求
    requestBody = {
      prompt: JSON.stringify(payload),
      model: model || provider.default_model,
      n: 1,
      size: '1024x1024'
    };
  }

  // 发送请求
  const response = await fetch(`${provider.base_url}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Provider请求失败: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  // 解析响应
  if (provider.type === 'llm') {
    const content = result.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Provider响应格式错误');
    }

    // 尝试解析JSON
    try {
      const data = JSON.parse(content);
      return { ok: true, data };
    } catch (e) {
      // 如果不是JSON，直接返回文本
      return { ok: true, data: { text: content } };
    }
  } else if (provider.type === 'image') {
    const imageUrl = result.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('Provider响应格式错误');
    }
    return { ok: true, data: { image_url: imageUrl } };
  }

  return { ok: false, error: { code: 'UNKNOWN_TYPE', message: '未知的Provider类型' } };
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
    const response = await fetch(`${provider.base_url}${endpoint}`, {
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
