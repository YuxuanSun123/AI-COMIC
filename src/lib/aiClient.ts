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
 * 生成镜头卡（预留，暂未实现）
 * @param payload 生成参数
 * @returns 占位响应
 */
export async function generateVideoCards(payload: unknown): Promise<ApiResponse<unknown>> {
  console.log('generateVideoCards called with:', payload);
  return {
    ok: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '镜头卡生成功能暂未实现'
    }
  };
}

/**
 * 生成剪辑计划（预留，暂未实现）
 * @param payload 生成参数
 * @returns 占位响应
 */
export async function generateEditPlan(payload: unknown): Promise<ApiResponse<unknown>> {
  console.log('generateEditPlan called with:', payload);
  return {
    ok: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '剪辑计划生成功能暂未实现'
    }
  };
}

export default {
  generateScript,
  generateStoryboard,
  generateVideoCards,
  generateEditPlan
};
