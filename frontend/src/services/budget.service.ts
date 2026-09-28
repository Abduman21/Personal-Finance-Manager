import { api } from './api';
import { Budget } from '../types';

export const budgetService = {
  getBudgets: (period?: string) => {
    const query = period ? `?period=${period}` : '';
    return api.get<{ period: string; budgets: Budget[] }>(`/budgets${query}`);
  },
  create: (data: any) => api.post<{ message: string; budget: Budget }>('/budgets', data),
  update: (id: string, data: any) => api.put<{ message: string; budget: Budget }>(`/budgets/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/budgets/${id}`),
};
