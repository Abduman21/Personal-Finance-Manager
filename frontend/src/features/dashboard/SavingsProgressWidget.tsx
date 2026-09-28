import React from 'react';
import { Card } from '../../components/common/Card';
import { SavingsGoal } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

interface WidgetProps {
  goals: SavingsGoal[];
}

export const SavingsProgressWidget: React.FC<WidgetProps> = ({ goals }) => {
  const { currency } = useAuth();

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Savings Goals</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Target goal achievements</p>
        </div>
        <Link
          to="/savings"
          className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 hover:underline"
        >
          View goals
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No savings goals set yet. Create goals like "Emergency Fund" or "Vacation"!
        </div>
      ) : (
        <div className="space-y-4">
          {goals.slice(0, 3).map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

            return (
              <div key={goal._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white truncate">
                    {goal.isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    <span className="truncate">{goal.name}</span>
                  </div>
                  <span className="font-bold text-emerald-500 shrink-0">{pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
                  </span>
                  <span>Target: {formatDate(goal.targetDate)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
