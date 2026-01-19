// 数据客户端工厂 - 统一数据访问入口

import type { DataClient, StorageMode } from './dataClient.types';
import { localTableClient } from './localTableClient';

// 当前存储模式（可通过环境变量配置）
const STORAGE_MODE: StorageMode = (import.meta.env.VITE_STORAGE_MODE as StorageMode) || 'local';

// 获取数据客户端实例
export function getDataClient(): DataClient {
  switch (STORAGE_MODE) {
    case 'local':
      return localTableClient;
    case 'remote':
      // TODO: 实现 RemoteApiClient
      throw new Error('Remote API client not implemented yet');
    default:
      return localTableClient;
  }
}

// 导出默认客户端
export const dataClient = getDataClient();

// 导出类型
export type { DataClient, StorageMode } from './dataClient.types';
export type { ApiResponse, ErrorCode, QueryOptions } from './dataClient.types';
