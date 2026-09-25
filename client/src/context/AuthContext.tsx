import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, ApiResponse } from '../types';
import { get, post, setAccessToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await get<ApiResponse<{ user: User }>>('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        // Try refresh then retry
        try {
          const refreshRes = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            setAccessToken(refreshData.data.accessToken);
            const retryRes = await get<ApiResponse<{ user: User }>>('/auth/me');
            setUser(retryRes.data.user);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (data: any) => {
    const res = await post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', data);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  };

  const register = async (data: any) => {
    await post('/auth/register', data);
  };

  const logout = async () => {
    try {
      await post('/auth/logout', {});
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
