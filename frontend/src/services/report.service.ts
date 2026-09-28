import { api } from './api';
import { DashboardOverview, DetailedReports } from '../types';

export const reportService = {
  getDashboard: () => api.get<DashboardOverview>('/reports/dashboard'),
  getReports: (options: { startDate?: string; endDate?: string; year?: number } = {}) => {
    const params = new URLSearchParams();
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.year) params.append('year', String(options.year));
    return api.get<DetailedReports>(`/reports/analytics?${params.toString()}`);
  },
};
