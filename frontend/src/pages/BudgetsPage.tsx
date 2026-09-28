import React, { useEffect, useState } from 'react';
import { budgetService } from '../services/budget.service';
import { Budget } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';
import { BudgetModal } from '../features/budgets/BudgetModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, PieChart, AlertTriangle } from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const { currency } = useAuth();
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // 'YYYY-MM'
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const res = await budgetService.getBudgets(period);
      setBudgets(res.budgets);
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [period]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await budgetService.delete(deleteTargetId);
      setDeleteTargetId(null);
      fetchBudgets();
    } catch (err) {
      console.error('Delete budget failed', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalAllocated = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Monthly Budgeting
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor allocated vs actual spending caps for period {period}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-40 text-xs py-1.5"
          />
          <Button
            onClick={() => {
              setEditingBudget(null);
              setModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Budget
          </Button>
        </div>
      </div>

      {/* Summary Stat Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <span className="text-xs font-semibold text-slate-500">Total Allocated Budget</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalAllocated, currency)}
          </h3>
        </Card>
        <Card>
          <span className="text-xs font-semibold text-slate-500">Total Spent This Month</span>
          <h3 className="text-2xl font-black text-rose-500 mt-1">
            {formatCurrency(totalSpent, currency)}
          </h3>
        </Card>
        <Card>
          <span className="text-xs font-semibold text-slate-500">Total Budget Remaining</span>
          <h3 className="text-2xl font-black text-emerald-500 mt-1">
            {formatCurrency(totalRemaining, currency)}
          </h3>
        </Card>
      </div>

      {/* Budget List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : budgets.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PieChart className="w-8 h-8" />}
            title="No budgets created yet"
            description="Create monthly budget caps to track and limit category spending."
            actionLabel="Create Budget"
            onAction={() => {
              setEditingBudget(null);
              setModalOpen(true);
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const categoryObj = typeof budget.categoryId === 'object' ? budget.categoryId : null;
            const pct = budget.percentageUsed;

            // Requirements visual color states: 75%, 90%, 100%
            let barColor = 'bg-emerald-500';
            let badgeBg = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
            let isOver = pct >= 100;

            if (pct >= 100) {
              barColor = 'bg-rose-500';
              badgeBg = 'bg-rose-500/10 text-rose-500 border-rose-500/30 font-bold';
            } else if (pct >= 90) {
              barColor = 'bg-rose-400';
              badgeBg = 'bg-rose-400/10 text-rose-400 border-rose-400/30';
            } else if (pct >= 75) {
              barColor = 'bg-amber-500';
              badgeBg = 'bg-amber-500/10 text-amber-500 border-amber-500/30';
            }

            return (
              <Card key={budget._id} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {budget.name}
                      </h3>
                      {categoryObj && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${categoryObj.color}20`,
                            color: categoryObj.color,
                          }}
                        >
                          {categoryObj.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Period: {budget.period}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingBudget(budget);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(budget._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Numbers */}
                <div className="flex items-baseline justify-between text-sm">
                  <div className="font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(budget.spentAmount, currency)}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      / {formatCurrency(budget.amount, currency)}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs border ${badgeBg}`}>
                    {isOver ? 'Exceeded!' : `${pct}% used`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Remaining: aggregate limit cap{' '}
                    <strong className="text-slate-900 dark:text-slate-100">
                      {formatCurrency(budget.remainingAmount, currency)}
                    </strong>
                  </span>
                  {pct >= 75 && (
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {pct >= 100 ? 'Limit Exceeded' : 'Approaching limit'}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={fetchBudgets}
        initialData={editingBudget}
        defaultPeriod={period}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget"
        message="Are you sure you want to delete this budget plan?"
        isLoading={isDeleting}
      />
    </div>
  );
};
