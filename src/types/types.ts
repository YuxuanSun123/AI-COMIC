// AI漫剧工作坊数据类型定义

// 用户类型
export interface User {
  id: string;
  nickname: string;
  email: string;
  password_hash: string; // 注意：仅演示用途，不安全
  membership_tier: 'free' | 'pro' | 'studio';
  created_ms: number;
  updated_ms: number;
}

// 作品类型
export type WorkType = 'script' | 'storyboard' | 'video_cards' | 'edit_plan';

export interface Work {
  id: string;
  type: WorkType;
  title: string;
  content: ScriptContent | EnhancedScriptContent | StoryboardContent | EnhancedStoryboardContent | VideoCardsContent | EnhancedVideoCardsContent | EditPlanContent | EnhancedEditPlanContent;
  author_id: string;
  lang: 'zh' | 'en';
  created_ms: number;
  updated_ms: number;
}

// 剧本内容结构（新版 - 用于AI生成和工具联动）
export interface EnhancedScriptContent {
  genre: string; // 题材
  lang: 'zh' | 'en'; // 语言
  logline: string; // 一句话概述
  world: string; // 世界观/设定
  characters: Character[]; // 角色列表
  constraints?: string; // 约束条件
  params: ScriptParams; // 生成参数
  script_text: string; // 完整剧本文字
  scenes: EnhancedScene[]; // 结构化场景列表
  updated_from: {
    source_script_id: string | null; // 来源剧本ID
  };
}

// 角色定义
export interface Character {
  name: string; // 角色名
  traits: string; // 性格特征
  relation: string; // 关系/身份
}

// 剧本生成参数
export interface ScriptParams {
  length_level: 'short' | 'mid' | 'long'; // 长度级别
  pace: 'slow' | 'mid' | 'fast'; // 节奏
  temperature: number; // 温度（0-1）
  style_tag: string; // 风格标签
}

// 增强场景结构（用于AI生成和分镜联动）
export interface EnhancedScene {
  scene_no: number; // 场景编号
  location: string; // 地点
  summary: string; // 场景摘要
  dialogues: Dialogue[]; // 对话列表
  actions: string[]; // 动作描述
  camera_suggestions: string; // 镜头建议
}

// 剧本内容结构（旧版 - 保持兼容）
export interface ScriptContent {
  acts: Act[];
}

export interface Act {
  act_number: number;
  scenes: Scene[];
}

export interface Scene {
  scene_number: number;
  location: string;
  characters: string[];
  dialogues: Dialogue[];
  actions: string[];
  camera_suggestions: string;
}

export interface Dialogue {
  speaker: string;
  line: string;
}

// 分镜内容结构（新版 - 用于AI生成和工具联动）
export interface EnhancedStoryboardContent {
  lang: 'zh' | 'en'; // 语言
  genre: string; // 题材
  source: {
    script_id: string | null; // 来源剧本ID
    script_title: string; // 来源剧本标题
    script_updated_ms: number; // 来源剧本更新时间
  };
  params: StoryboardParams; // 生成参数
  shots: EnhancedShot[]; // 镜头列表
  updated_from: {
    source_storyboard_id: string | null; // 来源分镜ID
  };
}

// 分镜生成参数
export interface StoryboardParams {
  shot_density: 'sparse' | 'standard' | 'dense'; // 镜头密度
  visual_style: string; // 视觉风格
  camera_variety: 'low' | 'mid' | 'high'; // 镜头多样性
  temperature: number; // 温度（0-1）
  max_shots: number; // 最大镜头数
}

// 增强镜头结构（用于AI生成和镜头卡联动）
export interface EnhancedShot {
  shot_no: number; // 镜头编号
  scene_ref: number; // 来自第几场景
  frame: string; // 画面描述
  action: string; // 动作
  camera: string; // 机位/焦段/运动
  dialogue: string; // 对白/旁白
  duration_sec: number; // 时长（秒）
  notes: string; // 备注
}

// 分镜内容结构（旧版 - 保持兼容）
export interface StoryboardContent {
  shots: Shot[];
}

export interface Shot {
  shot_number: number;
  image_description: string;
  action: string;
  camera_position: string;
  dialogue: string;
}

// 镜头卡内容结构（新版 - 用于AI生成和工具联动）
export interface EnhancedVideoCardsContent {
  lang: 'zh' | 'en'; // 语言
  genre: string; // 题材
  source: {
    storyboard_id: string | null; // 来源分镜ID
    storyboard_title: string; // 来源分镜标题
    shot_count: number; // 来源镜头数
  };
  params: VideoCardsParams; // 生成参数
  cards: EnhancedVideoCard[]; // 镜头卡列表
  updated_from: {
    source_video_cards_id: string | null; // 来源镜头卡ID
  };
}

// 镜头卡生成参数
export interface VideoCardsParams {
  render_style: string; // 渲染风格
  character_consistency: 'low' | 'mid' | 'high'; // 角色一致性
  detail_level: 'low' | 'mid' | 'high'; // 细节级别
  camera_emphasis: 'weak' | 'mid' | 'strong'; // 镜头强调
  temperature: number; // 温度（0-1）
}

// 增强镜头卡结构（用于AI生成和剪辑合成联动）
export interface EnhancedVideoCard {
  card_no: number; // 镜头卡编号
  shot_ref: number; // 对应shot_no
  visual_desc: string; // 画面描述（偏视觉）
  character_action: string; // 人物与动作
  lighting_mood: string; // 光影/氛围/情绪
  camera_desc: string; // 机位与运动
  dialogue_voiceover: string; // 对白/旁白
  prompt: string; // AI Prompt（自动拼接生成）
  negative_prompt: string; // 负面Prompt
  notes: string; // 备注
}

// 镜头卡内容结构（旧版 - 保持兼容）
export interface VideoCardsContent {
  cards: VideoCard[];
}

export interface VideoCard {
  id: string;
  image_description: string;
  action: string;
  lighting: string;
  narration: string;
  prompt: string;
  order: number;
}

// 剪辑计划内容结构（新版 - 用于AI生成和工具联动）
export interface EnhancedEditPlanContent {
  lang: 'zh' | 'en'; // 语言
  genre: string; // 题材
  source: {
    video_cards_id: string | null; // 来源镜头卡ID
    video_cards_title: string; // 来源镜头卡标题
    card_count: number; // 来源镜头卡数
    storyboard_id?: string; // 来源分镜ID（可选）
  };
  params: EditPlanParams; // 生成参数
  items: EnhancedEditItem[]; // 剪辑条目列表
  totals: {
    total_items: number; // 总条目数
    total_sec: number; // 总时长（秒）
  };
}

// 剪辑计划生成参数
export interface EditPlanParams {
  pace: 'slow' | 'normal' | 'fast'; // 节奏
  target_total_sec: number; // 目标总时长（秒）
  transition_style: 'clean' | 'cinematic' | 'dynamic'; // 转场风格
  audio_style: 'minimal' | 'rich' | 'dramatic'; // 音频风格
  subtitle_density: 'low' | 'mid' | 'high'; // 字幕密度
  temperature: number; // 温度（0-1）
}

// 增强剪辑条目结构（用于AI生成和剪辑合成）
export interface EnhancedEditItem {
  item_no: number; // 序号
  shot_ref: number; // 对应shot/card编号
  source_prompt_ref: number; // 用于回溯prompt
  asset_need: string; // 素材需求
  voice_sfx: string; // 配音/音效
  transition: string; // 转场
  duration_sec: number; // 时长（秒）
  caption_subtitle: string; // 字幕要点
  notes: string; // 备注
}

// 剪辑计划内容结构（旧版 - 保持兼容）
export interface EditPlanContent {
  clips: EditClip[];
}

export interface EditClip {
  id: string;
  shot_number: string;
  material_requirement: string;
  audio_effect: string;
  transition: string;
  duration: string;
  notes: string;
  order: number;
}

// 新闻类型
export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  author_id: string;
  created_ms: number;
  updated_ms: number;
}

// 友情链接类型
export interface Link {
  id: string;
  name: string;
  url: string;
  desc: string;
  tags: string[];
  author_id: string;
  created_ms: number;
  updated_ms: number;
}

// 当前用户信息（localStorage存储）
export interface CurrentUser {
  id: string;
  nickname: string;
  membership_tier: 'free' | 'pro' | 'studio';
  logged_in: boolean;
}

// 表名类型
export type TableName = 'users' | 'works' | 'news' | 'links';

// API 错误响应
export interface ApiError {
  code: number;
  message: string;
}

// ============================================
// 多API接入结构类型定义
// ============================================

// Provider类型
export type ProviderType = 'llm' | 'image' | 'tts' | 'asr';

// API Provider（服务提供商）
export interface ApiProvider {
  id: string; // 唯一标识
  name: string; // 自定义名称，如 "OpenAI-主用"
  type: ProviderType; // 类型：llm/image/tts/asr
  enabled: boolean; // 是否启用
  base_url: string; // API Base URL
  api_key: string; // API Key
  default_model: string; // 默认模型名
  headers_json?: string; // 自定义Headers（JSON字符串）
  created_ms: number; // 创建时间
  updated_ms: number; // 更新时间
}

// 任务类型
export type TaskType = 'script' | 'storyboard' | 'video_cards' | 'edit_plan' | 'image_storyboard' | 'image_shot';

// 输出格式
export type OutputFormat = 'json' | 'md';

// 路由参数
export interface RoutingParams {
  temperature: number; // 温度（0-1）
  max_tokens: number; // 最大token数
  top_p: number; // Top P（0-1）
}

// 功能路由配置
export interface FunctionRouting {
  enabled: boolean; // 是否启用
  provider_id: string; // Provider ID
  model: string; // 模型名
  output_format: OutputFormat; // 输出格式
  params: RoutingParams; // 参数
  fallback_provider_id?: string; // 备用Provider ID（可选）
}

// API路由配置（所有功能的路由）
export interface ApiRouting {
  script: FunctionRouting; // 剧本生成
  storyboard: FunctionRouting; // 分镜生成
  video_cards: FunctionRouting; // 镜头卡生成
  edit_plan: FunctionRouting; // 剪辑计划生成
  image_storyboard: FunctionRouting; // 分镜图生成
  image_shot: FunctionRouting; // 镜头图生成
}

// Provider测试结果
export interface ProviderTestResult {
  success: boolean; // 是否成功
  latency?: number; // 延迟（毫秒）
  error?: string; // 错误信息
  message?: string; // 成功消息
}
