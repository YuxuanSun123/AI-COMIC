// AI漫剧工作坊数据类型定义

// 用户类型
export interface User {
  id: string;
  nickname: string;
  email: string;
  password_hash: string; // 注意：仅演示用途，不安全
  membership_tier: 'free' | 'pro' | 'studio';
  created_ms: number;
}

// 作品类型
export type WorkType = 'script' | 'storyboard' | 'video_cards' | 'edit_plan';

export interface Work {
  id: string;
  type: WorkType;
  title: string;
  content: ScriptContent | StoryboardContent | VideoCardsContent | EditPlanContent;
  author_id: string;
  lang: 'zh' | 'en';
  created_ms: number;
  updated_ms: number;
}

// 剧本内容结构
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

// 分镜内容结构
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

// 镜头卡内容结构
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
