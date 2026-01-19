// 统一API响应类型

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
  };
}

// 错误码定义
export enum ErrorCode {
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  CONFLICT = 409,
  VALIDATION_ERROR = 422,
  INTERNAL_ERROR = 500
}

// 存储模式
export type StorageMode = 'local' | 'remote';

// 数据客户端接口
export interface DataClient {
  // 通用CRUD
  get<T>(table: string, id?: string): Promise<ApiResponse<T | T[]>>;
  post<T>(table: string, data: Partial<T>): Promise<ApiResponse<T>>;
  patch<T>(table: string, id: string, data: Partial<T>): Promise<ApiResponse<T>>;
  delete(table: string, id: string): Promise<ApiResponse<boolean>>;
  
  // 查询
  query<T>(table: string, options?: QueryOptions): Promise<ApiResponse<T[]>>;
}

export interface QueryOptions {
  filter?: Record<string, unknown>;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// 认证相关
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  nickname: string;
}

export interface AuthResponse {
  user: {
    id: string;
    nickname: string;
    email: string;
    membership_tier: 'free' | 'pro' | 'studio';
  };
  token?: string; // 远程模式使用
}
