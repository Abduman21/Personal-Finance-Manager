import { api } from './api';
import { Category } from '../types';

export const categoryService = {
  getCategories: () => api.get<{ categories: Category[] }>('/categories'),
  create: (data: any) => api.post<{ message: string; category: Category }>('/categories', data),
  update: (id: string, data: any) =>
    api.put<{ message: string; category: Category }>(`/categories/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/categories/${id}`),
};
