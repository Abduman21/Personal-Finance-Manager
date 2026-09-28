import { api } from './api';
import { Transaction } from '../types';

export interface TransactionFilters {
  type?: 'income' | 'expense';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const transactionService = {
  getTransactions: (filters: TransactionFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '') params.append(key, String(val));
    });
    return api.get<{ transactions: Transaction[]; total: number; page: number; pages: number }>(
      `/transactions?${params.toString()}`
    );
  },
  create: (data: any) => api.post<{ message: string; transaction: Transaction }>('/transactions', data),
  update: (id: string, data: any) =>
    api.put<{ message: string; transaction: Transaction }>(`/transactions/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/transactions/${id}`),
  exportCSV: async (filters: TransactionFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '') params.append(key, String(val));
    });
    const url = `${import.meta.env.VITE_API_URL || '/api'}/transactions/export/csv?${params.toString()}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to export CSV');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `financeflow-transactions-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
