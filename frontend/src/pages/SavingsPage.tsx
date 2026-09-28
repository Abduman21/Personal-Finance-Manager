import React, { useEffect, useState } from 'react';
import { savingsService } from '../services/savings.service';
import { SavingsGoal } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';
import { GoalModal } from '../features/savings/GoalModal';
import { ContributionModal } from '../features/savings/ContributionModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, PiggyBank, PlusCircle, CheckCircle2, Calendar } from 'lucide-react';

export const SavingsPage: React.FC = () => {
  const { currency } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [contribGoal, setContribGoal] = useState<SavingsGoal | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const res = await savingsService.getGoals();
      setGoals(res.goals);
    } catch (err) {
      console.error('Failed to load savings goals', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await savingsService.delete(deleteTargetId);
      setDeleteTargetId(null);
      fetchGoals();
    } catch (err) {
      console.error('Delete goal failed', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Savings Goals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set and achieve financial targets like emergency funds or major purchases
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingGoal(null);
            setModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Create Goal
        </Button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Saved Across Goals</span>
            <h3 className="text-2xl font-black text-emerald-500 mt-1">
              {formatCurrency(totalSaved, currency)}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <PiggyBank className="w-6 h-6" />
          </div>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Combined Target Goal</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalTarget, currency)}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Calendar className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PiggyBank className="w-8 h-8" />}
            title="No savings goals yet"
            description="Start building your financial future by setting clear savings milestones."
            actionLabel="Create Goal"
            onAction={() => {
              setEditingGoal(null);
              setModalOpen(true);
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <Card key={goal._id} className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {goal.name}
                      </h3>
                      {goal.isCompleted && (
                        <span title="Goal Achieved!">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(goal._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {goal.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-extrabold text-slate-900 dark:text-white text-base">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                    <span className="text-slate-400">
                      Target: {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-emerald-500">{pct}% Completed</span>
                    <span>Target Date: {formatDate(goal.targetDate)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {remaining === 0 ? 'Goal fully reached!' : `${formatCurrency(remaining, currency)} to go`}
                  </span>
                  <Button
                    size="sm"
                    variant={goal.isCompleted ? 'outline' : 'primary'}
                    onClick={() => setContribGoal(goal)}
                    icon={<PlusCircle className="w-3.5 h-3.5" />}
                  >
                    Contribute
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <GoalModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGoal(null);
        }}
        onSuccess={fetchGoals}
        initialData={editingGoal}
      />

      <ContributionModal
        isOpen={!!contribGoal}
        onClose={() => setContribGoal(null)}
        onSuccess={fetchGoals}
        goal={contribGoal}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Savings Goal"
        message="Are you sure you want to delete this savings goal?"
        isLoading={isDeleting}
      />
    </div>
  );
};
