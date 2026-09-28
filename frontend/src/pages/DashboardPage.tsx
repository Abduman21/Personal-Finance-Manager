import React, { useEffect, useState } from 'react';
import { reportService } from '../services/report.service';
import { DashboardOverview } from '../types';
import { StatCards } from '../features/dashboard/StatCards';
import { IncomeVsExpenseChart } from '../features/dashboard/IncomeVsExpenseChart';
import { CategorySpendingChart } from '../features/dashboard/CategorySpendingChart';
import { RecentTransactionsWidget } from '../features/dashboard/RecentTransactionsWidget';
import { BudgetOverviewWidget } from '../features/dashboard/BudgetOverviewWidget';
import { SavingsProgressWidget } from '../features/dashboard/SavingsProgressWidget';
import { UpcomingRecurringWidget } from '../features/dashboard/UpcomingRecurringWidget';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { PlusCircle, PiggyBank, PieChart, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { TransactionModal } from '../features/transactions/TransactionModal';
import { BudgetModal } from '../features/budgets/BudgetModal';
import { GoalModal } from '../features/savings/GoalModal';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick Action Modal States
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<'income' | 'expense'>('expense');
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await reportService.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openAddIncome = () => {
    setTxModalType('income');
    setTxModalOpen(true);
  };

  const openAddExpense = () => {
    setTxModalType('expense');
    setTxModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[340px] rounded-2xl" />
          <Skeleton className="h-[340px] rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-4">
        <p className="text-sm font-semibold text-rose-400">{error}</p>
        <Button onClick={fetchDashboardData} variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
          Retry Loading
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Quick Action Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white">Quick Actions</h2>
          <p className="text-xs text-slate-400">Perform frequent financial management tasks instantly</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={openAddIncome}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            icon={<ArrowUpRight className="w-4 h-4" />}
          >
            + Add Income
          </Button>
          <Button
            onClick={openAddExpense}
            size="sm"
            variant="danger"
            icon={<ArrowDownRight className="w-4 h-4" />}
          >
            + Add Expense
          </Button>
          <Button
            onClick={() => setBudgetModalOpen(true)}
            size="sm"
            variant="secondary"
            icon={<PieChart className="w-4 h-4" />}
          >
            + Create Budget
          </Button>
          <Button
            onClick={() => setGoalModalOpen(true)}
            size="sm"
            variant="outline"
            icon={<PiggyBank className="w-4 h-4" />}
          >
            + Create Goal
          </Button>
        </div>
      </div>

      {/* Primary Top Stat Cards */}
      <StatCards
        totalBalance={data.totalBalance}
        monthlyIncome={data.monthlyIncome}
        monthlyExpenses={data.monthlyExpenses}
        totalSavings={data.totalSavings}
        budgetRemaining={data.budgetRemaining}
      />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeVsExpenseChart data={data.monthlyTrend} />
        <CategorySpendingChart data={data.categorySpending} />
      </div>

      {/* Lower Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RecentTransactionsWidget transactions={data.recentTransactions} />
        <BudgetOverviewWidget budgets={data.budgets} />
        <SavingsProgressWidget goals={data.savingsGoals} />
        <UpcomingRecurringWidget recurring={data.upcomingRecurring} />
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onSuccess={fetchDashboardData}
        defaultType={txModalType}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onSuccess={fetchDashboardData}
      />

      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};
