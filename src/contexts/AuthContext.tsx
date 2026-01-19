// 认证上下文 - 基于 localStorage 的演示登录系统
// 注意：仅用于演示，密码存储不安全

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import tableApi from '@/lib/tableApi';
import type { User, CurrentUser } from '@/types';

interface AuthContextType {
  currentUser: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (email: string, nickname: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 简单哈希函数（仅演示用途，不安全）
function simpleHash(password: string): string {
  // 注意：这只是演示，实际应用中绝不应该这样做
  return `hash_${password}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 页面加载时检查登录态
  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        localStorage.removeItem('current_user');
      }
    }
    setLoading(false);
  }, []);

  // 登录
  const login = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { error: new Error('邮箱格式不正确') };
      }

      // 查找用户
      const users = tableApi.get<User>('users') as User[];
      const user = users.find(u => u.email === email);

      if (!user) {
        return { error: new Error('用户不存在') };
      }

      // 验证密码（简单哈希对比）
      const hashedPassword = simpleHash(password);
      if (user.password_hash !== hashedPassword) {
        return { error: new Error('密码错误') };
      }

      // 保存登录态
      const currentUserData: CurrentUser = {
        id: user.id,
        nickname: user.nickname,
        membership_tier: user.membership_tier,
        logged_in: true
      };

      localStorage.setItem('current_user', JSON.stringify(currentUserData));
      setCurrentUser(currentUserData);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // 注册
  const register = async (
    email: string,
    nickname: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    try {
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { error: new Error('邮箱格式不正确') };
      }

      // 验证密码长度
      if (password.length < 6) {
        return { error: new Error('密码长度至少6位') };
      }

      // 检查邮箱是否已存在
      const users = tableApi.get<User>('users') as User[];
      const existingUser = users.find(u => u.email === email);

      if (existingUser) {
        return { error: new Error('邮箱已被注册') };
      }

      // 创建新用户
      const newUser: Omit<User, 'id'> = {
        email,
        nickname,
        password_hash: simpleHash(password), // 注意：仅演示用途，不安全
        membership_tier: 'free',
        created_ms: Date.now(),
        updated_ms: Date.now()
      };

      const result = tableApi.post<User>('users', newUser);

      if ('code' in result) {
        return { error: new Error(result.message) };
      }

      // 自动登录
      const currentUserData: CurrentUser = {
        id: result.id,
        nickname: result.nickname,
        membership_tier: result.membership_tier,
        logged_in: true
      };

      localStorage.setItem('current_user', JSON.stringify(currentUserData));
      setCurrentUser(currentUserData);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // 退出登录
  const logout = () => {
    localStorage.removeItem('current_user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
