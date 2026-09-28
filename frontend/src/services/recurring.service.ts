import { api } from './api';
import { RecurringTransaction } from '../types';

export const recurringService = {
  getRecurring: () => api.get<{ recurring: RecurringTransaction[] }>('/recurring'),
  create: (data: any) =>
    api.post<{ message: string; recurring: RecurringTransaction }>('/recurring', data),
  update: (id: string, data: any) =>
    api.put<{ message: string; recurring: RecurringTransaction }>(`/recurring/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/recurring/${id}`),
  processDue: () => api.post<{ message: string; processedCount: number }>('/recurring/process'),
};
