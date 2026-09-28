import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Currency, Theme } from '../types';
import { authService } from '../services/auth.service';
import { useTheme } from './ThemeContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  currency: Currency;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setTheme } = useTheme();

  const fetchSession = async () => {
    try {
      setIsLoading(true);
      const res = await authService.getMe();
      setUser(res.user);
      if (res.user.theme) {
        setTheme(res.user.theme);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (data: any) => {
    const res = await authService.login(data);
    setUser(res.user);
    if (res.user.theme) {
      setTheme(res.user.theme);
    }
  };

  const register = async (data: any) => {
    const res = await authService.register(data);
    setUser(res.user);
    if (res.user.theme) {
      setTheme(res.user.theme);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    if (updated.theme) {
      setTheme(updated.theme);
    }
  };

  const currency: Currency = user?.currency || 'USD';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, currency }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
