// localStorage 封装 - RESTful Table API
// 提供类似数据库的 CRUD 操作接口

import type { TableName, ApiError, User, Work, News, Link } from '@/types';

type TableData = User | Work | News | Link;

class TableApi {
  // 获取表数据
  private getTable(table: TableName): TableData[] {
    const data = localStorage.getItem(table);
    return data ? JSON.parse(data) : [];
  }

  // 保存表数据
  private saveTable(table: TableName, data: TableData[]): void {
    localStorage.setItem(table, JSON.stringify(data));
  }

  // 生成唯一ID
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * GET - 获取数据
   * @param table 表名
   * @param id 可选，指定ID则返回单条数据
   * @returns 数据数组或单条数据，不存在返回null
   */
  get<T extends TableData>(table: TableName, id?: string): T[] | T | null {
    const data = this.getTable(table) as T[];
    
    if (!id) {
      return data;
    }
    
    const item = data.find((item: any) => item.id === id);
    return item ? (item as T) : null;
  }

  /**
   * POST - 插入数据
   * @param table 表名
   * @param data 数据对象（不含id）
   * @returns 新生成的数据对象或错误信息
   */
  post<T extends TableData>(table: TableName, data: Omit<T, 'id'>): T | ApiError {
    try {
      const tableData = this.getTable(table);
      const idPrefix = table.slice(0, -1); // users -> user, works -> work
      const newItem = {
        id: this.generateId(idPrefix),
        ...data
      } as T;
      
      tableData.push(newItem);
      this.saveTable(table, tableData);
      
      return newItem;
    } catch (error) {
      return {
        code: 500,
        message: `插入数据失败: ${error}`
      };
    }
  }

  /**
   * PATCH - 更新数据
   * @param table 表名
   * @param id 数据ID
   * @param data 更新的字段
   * @returns 更新后的数据对象或错误信息
   */
  patch<T extends TableData>(
    table: TableName,
    id: string,
    data: Partial<Omit<T, 'id'>>
  ): T | ApiError {
    try {
      const tableData = this.getTable(table) as T[];
      const index = tableData.findIndex((item: any) => item.id === id);
      
      if (index === -1) {
        return {
          code: 404,
          message: '数据不存在'
        };
      }
      
      tableData[index] = {
        ...tableData[index],
        ...data
      };
      
      this.saveTable(table, tableData);
      return tableData[index];
    } catch (error) {
      return {
        code: 500,
        message: `更新数据失败: ${error}`
      };
    }
  }

  /**
   * DELETE - 删除数据
   * @param table 表名
   * @param id 数据ID
   * @returns 成功返回true，失败返回错误信息
   */
  delete(table: TableName, id: string): true | ApiError {
    try {
      const tableData = this.getTable(table);
      const index = tableData.findIndex((item: any) => item.id === id);
      
      if (index === -1) {
        return {
          code: 404,
          message: '数据不存在'
        };
      }
      
      tableData.splice(index, 1);
      this.saveTable(table, tableData);
      
      return true;
    } catch (error) {
      return {
        code: 500,
        message: `删除数据失败: ${error}`
      };
    }
  }

  /**
   * 初始化表数据（如果不存在）
   */
  initTable(table: TableName, defaultData: TableData[]): void {
    const existing = localStorage.getItem(table);
    if (!existing) {
      this.saveTable(table, defaultData);
    }
  }

  /**
   * 清空表数据
   */
  clearTable(table: TableName): void {
    localStorage.removeItem(table);
  }

  /**
   * 清空所有数据
   */
  clearAll(): void {
    localStorage.clear();
  }
}

// 导出单例
export const tableApi = new TableApi();
export default tableApi;
