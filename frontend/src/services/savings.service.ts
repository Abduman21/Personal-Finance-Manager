import { api } from './api';
import { SavingsGoal } from '../types';

export const savingsService = {
  getGoals: () => api.get<{ goals: SavingsGoal[] }>('/savings'),
  create: (data: any) => api.post<{ message: string; goal: SavingsGoal }>('/savings', data),
  update: (id: string, data: any) =>
    api.put<{ message: string; goal: SavingsGoal }>(`/savings/${id}`, data),
  contribute: (id: string, amount: number) =>
    api.post<{ message: string; goal: SavingsGoal }>(`/savings/${id}/contribute`, { amount }),
  delete: (id: string) => api.delete<{ message: string }>(`/savings/${id}`),
};
