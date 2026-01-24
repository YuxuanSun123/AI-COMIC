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
  content: ScriptContent | EnhancedScriptContent | StoryboardContent | EnhancedStoryboardContent | VideoCardsContent | EnhancedVideoCardsContent | EditPlanContent;
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

// 剪辑计划内容结构
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
