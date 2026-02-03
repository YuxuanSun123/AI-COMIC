// 本地存储数据客户端实现

import type { 
  DataClient, 
  ApiResponse, 
  // ErrorCode, 
  QueryOptions 
} from './dataClient.types';
import type { TableName, User, Work, News, Link } from '@/types';

type TableData = User | Work | News | Link;

// 表名白名单
const ALLOWED_TABLES: TableName[] = ['users', 'works', 'news', 'links'];

export class LocalTableClient implements DataClient {
  private validateTable(table: string): table is TableName {
    if (!ALLOWED_TABLES.includes(table as TableName)) {
      throw new Error(`Invalid table name: ${table}`);
    }
    return true;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTableData<T>(table: TableName): T[] {
    try {
      const data = localStorage.getItem(table);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setTableData<T>(table: TableName, data: T[]): void {
    localStorage.setItem(table, JSON.stringify(data));
  }

  async get<T>(table: string, id?: string): Promise<ApiResponse<T | T[]>> {
    try {
      this.validateTable(table);
      const data = this.getTableData<T>(table as TableName);

      if (id) {
        const item = data.find((item: T) => (item as TableData).id === id);
        if (!item) {
          return {
            ok: false,
            error: {
              code: 404,
              message: '数据不存在'
            }
          };
        }
        return { ok: true, data: item };
      }

      return { ok: true, data };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : '内部错误'
        }
      };
    }
  }

  async post<T>(table: string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      this.validateTable(table);
      const tableData = this.getTableData<T>(table as TableName);
      
      const newItem = {
        ...data,
        id: this.generateId(),
        created_ms: Date.now(),
        updated_ms: Date.now()
      } as T;

      tableData.push(newItem);
      this.setTableData(table as TableName, tableData);

      return { ok: true, data: newItem };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : '创建失败'
        }
      };
    }
  }

  async patch<T>(table: string, id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      this.validateTable(table);
      const tableData = this.getTableData<T>(table as TableName);
      const index = tableData.findIndex((item: T) => (item as TableData).id === id);

      if (index === -1) {
        return {
          ok: false,
          error: {
            code: 404,
            message: '数据不存在'
          }
        };
      }

      const updatedItem = {
        ...tableData[index],
        ...data,
        updated_ms: Date.now()
      } as T;

      tableData[index] = updatedItem;
      this.setTableData(table as TableName, tableData);

      return { ok: true, data: updatedItem };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : '更新失败'
        }
      };
    }
  }

  async delete(table: string, id: string): Promise<ApiResponse<boolean>> {
    try {
      this.validateTable(table);
      const tableData = this.getTableData<TableData>(table as TableName);
      const index = tableData.findIndex((item) => item.id === id);

      if (index === -1) {
        return {
          ok: false,
          error: {
            code: 404,
            message: '数据不存在'
          }
        };
      }

      tableData.splice(index, 1);
      this.setTableData(table as TableName, tableData);

      return { ok: true, data: true };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : '删除失败'
        }
      };
    }
  }

  async query<T>(table: string, options?: QueryOptions): Promise<ApiResponse<T[]>> {
    try {
      this.validateTable(table);
      let data = this.getTableData<T>(table as TableName);

      // 过滤
      if (options?.filter) {
        data = data.filter(item => {
          const itemData = item as Record<string, unknown>;
          return Object.entries(options.filter!).every(([key, value]) => {
            return itemData[key] === value;
          });
        });
      }

      // 搜索
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        data = data.filter(item => {
          const itemData = item as Record<string, unknown>;
          return Object.values(itemData).some(value => 
            value !== null && value !== undefined && String(value).toLowerCase().includes(searchLower)
          );
        });
      }

      // 排序
      if (options?.sort) {
        const sortKey = options.sort;
        const order = options.order || 'desc';
        data.sort((a, b) => {
          const aVal = (a as Record<string, unknown>)[sortKey] as number | string;
          const bVal = (b as Record<string, unknown>)[sortKey] as number | string;
          if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
          }
          return aVal < bVal ? 1 : -1;
        });
      }

      // 分页
      if (options?.limit) {
        const offset = options.offset || 0;
        data = data.slice(offset, offset + options.limit);
      }

      return { ok: true, data };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : '查询失败'
        }
      };
    }
  }

  // 初始化表数据
  initTable<T>(table: TableName, data: T[]): void {
    if (!this.getTableData(table).length) {
      this.setTableData(table, data);
    }
  }
}

// 导出单例
export const localTableClient = new LocalTableClient();
