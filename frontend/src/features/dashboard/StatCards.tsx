import React from 'react';
import { Card } from '../../components/common/Card';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, PieChart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface StatCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  budgetRemaining: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  totalSavings,
  budgetRemaining,
}) => {
  const { currency } = useAuth();

  const stats = [
    {
      label: 'Total Balance',
      value: totalBalance,
      icon: Wallet,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Monthly Income',
      value: monthlyIncome,
      icon: TrendingUp,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Monthly Expenses',
      value: monthlyExpenses,
      icon: TrendingDown,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
    {
      label: 'Total Savings',
      value: totalSavings,
      icon: PiggyBank,
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    },
    {
      label: 'Budget Remaining',
      value: budgetRemaining,
      icon: PieChart,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</span>
            <div className={`p-2 rounded-xl border ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(stat.value, currency)}
            </h3>
          </div>
        </Card>
      ))}
    </div>
  );
};
