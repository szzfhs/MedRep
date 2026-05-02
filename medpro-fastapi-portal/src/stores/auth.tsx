import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  getInfo,
  login as apiLogin,
  logout as apiLogout,
  LoginParams,
  UserInfo,
} from '@/api/auth';
import { getToken, setToken, removeToken } from '@/lib/request';

interface AuthState {
  token: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  /** 角色判断：student / teacher / admin */
  role: 'student' | 'teacher' | 'admin' | null;
}

interface AuthContextValue extends AuthState {
  login: (params: LoginParams) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveRole(userInfo: UserInfo | null): AuthState['role'] {
  if (!userInfo) return null;
  const roles = userInfo.roles ?? [];
  if (roles.includes('admin') || userInfo.permissions?.includes('*:*:*')) return 'admin';
  if (roles.includes('teacher')) return 'teacher';
  return 'student';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(!!getToken());

  const fetchUserInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await getInfo();
      setUserInfo(info);
    } catch {
      // token 失效时拦截器已跳转，此处清理状态
      removeToken();
      setTokenState(null);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 应用启动时，如果有 token，自动获取用户信息
  useEffect(() => {
    if (getToken()) {
      fetchUserInfo();
    }
  }, [fetchUserInfo]);

  const login = useCallback(async (params: LoginParams) => {
    const newToken = await apiLogin(params);
    setToken(newToken);
    setTokenState(newToken);
    await fetchUserInfo();
  }, [fetchUserInfo]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      removeToken();
      setTokenState(null);
      setUserInfo(null);
    }
  }, []);

  const value: AuthContextValue = {
    token,
    userInfo,
    isLoading,
    isLoggedIn: !!token && !!userInfo,
    role: resolveRole(userInfo),
    login,
    logout,
    refreshUserInfo: fetchUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
