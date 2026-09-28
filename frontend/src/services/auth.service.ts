import { api } from './api';
import { User } from '../types';

export const authService = {
  register: (data: any) => api.post<{ message: string; user: User }>('/auth/register', data),
  login: (data: any) => api.post<{ message: string; user: User }>('/auth/login', data),
  logout: () => api.post<{ message: string }>('/auth/logout'),
  getMe: () => api.get<{ user: User }>('/auth/me'),
  updateProfile: (data: Partial<User>) => api.patch<{ message: string; user: User }>('/auth/profile', data),
};
