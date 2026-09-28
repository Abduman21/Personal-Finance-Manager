import React, { useEffect, useState } from 'react';
import { reportService } from '../services/report.service';
import { DetailedReports } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Skeleton } from '../components/common/Skeleton';
import { Badge } from '../components/common/Badge';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { currency } = useAuth();
  const [filterType, setFilterType] = useState<'year' | 'custom'>('year');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [reports, setReports] = useState<DetailedReports | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const options =
        filterType === 'custom' && startDate && endDate
          ? { startDate, endDate }
          : { year: selectedYear };

      const res = await reportService.getReports(options);
      setReports(res);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterType, selectedYear, startDate, endDate]);

  const setPresetPeriod = (preset: 'currentMonth' | 'previousMonth' | 'thisYear') => {
    const now = new Date();
    if (preset === 'currentMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      setFilterType('custom');
      setStartDate(start);
      setEndDate(end);
    } else if (preset === 'previousMonth') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      setFilterType('custom');
      setStartDate(start);
      setEndDate(end);
    } else if (preset === 'thisYear') {
      setFilterType('year');
      setSelectedYear(now.getFullYear());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deep insights into income, category expenses, and monthly financial performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setPresetPeriod('currentMonth')}>
            Current Month
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPresetPeriod('previousMonth')}>
            Previous Month
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPresetPeriod('thisYear')}>
            Year {new Date().getFullYear()}
          </Button>
        </div>
      </div>

      {/* Filter Selector Card */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <Select
            label="Filter Period Mode"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            options={[
              { value: 'year', label: 'Full Year View' },
              { value: 'custom', label: 'Custom Date Range' },
            ]}
          />

          {filterType === 'year' ? (
            <Select
              label="Select Year"
              value={String(selectedYear)}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              options={[2024, 2025, 2026, 2027].map((y) => ({ value: String(y), label: `Year ${y}` }))}
            />
          ) : (
            <>
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          )}
        </div>
      </Card>

      {/* Summary KPI Cards */}
      {isLoading || !reports ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Period Income</span>
              <h3 className="text-2xl font-black text-emerald-500 mt-1">
                {formatCurrency(reports.totals.income, currency)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
          </Card>

          <Card className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Period Expenses</span>
              <h3 className="text-2xl font-black text-rose-500 mt-1">
                {formatCurrency(reports.totals.expense, currency)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
              <TrendingDown className="w-6 h-6" />
            </div>
          </Card>

          <Card className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Net Savings / Cashflow</span>
              <h3
                className={`text-2xl font-black mt-1 ${
                  reports.totals.net >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {formatCurrency(reports.totals.net, currency)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <DollarSign className="w-6 h-6" />
            </div>
          </Card>
        </div>
      )}

      {/* Main Charts */}
      {isLoading || !reports ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Spending Trend Area Chart */}
          <Card className="h-[360px] flex flex-col">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Financial Trend Overview
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reports.monthlyReport} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [formatCurrency(val, currency)]}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expense" name="Expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Highest Expense Categories Table */}
          <Card className="h-[360px] flex flex-col overflow-hidden">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Highest Expense Categories
            </h3>
            {reports.categoryReport.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                No expense category data for this period
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {reports.categoryReport.map((cat) => (
                  <div key={cat.categoryId} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || '#10b981' }}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cat.name}</h4>
                        <p className="text-[11px] text-slate-400">{cat.count} transaction(s)</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-rose-500">
                      {formatCurrency(cat.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
