import React from 'react';
import { Card } from '../../components/common/Card';
import { Budget } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface WidgetProps {
  budgets: Budget[];
}

export const BudgetOverviewWidget: React.FC<WidgetProps> = ({ budgets }) => {
  const { currency } = useAuth();

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Budget Overview</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Current month target progress</p>
        </div>
        <Link
          to="/budgets"
          className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 hover:underline"
        >
          Manage
        </Link>
      </div>

      {budgets.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No monthly budgets created yet. Set budget limits to prevent overspending!
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.slice(0, 4).map((budget) => {
            const categoryObj = typeof budget.categoryId === 'object' ? budget.categoryId : null;
            const pct = budget.percentageUsed;

            // Visual status bar colors according to requirements: 75%, 90%, 100%
            let barColor = 'bg-emerald-500';
            let textColor = 'text-emerald-500';

            if (pct >= 100) {
              barColor = 'bg-rose-500';
              textColor = 'text-rose-500 font-bold';
            } else if (pct >= 90) {
              barColor = 'bg-rose-400';
              textColor = 'text-rose-400';
            } else if (pct >= 75) {
              barColor = 'bg-amber-500';
              textColor = 'text-amber-500';
            }

            return (
              <div key={budget._id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {budget.name} {categoryObj && `(${categoryObj.name})`}
                  </span>
                  <span className="text-slate-500">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(budget.spentAmount, currency)}
                    </span>{' '}
                    / {formatCurrency(budget.amount, currency)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className={textColor}>
                    {pct >= 100 ? 'Over budget!' : `${pct}% used`}
                  </span>
                  <span className="text-slate-400">
                    {formatCurrency(budget.remainingAmount, currency)} remaining
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
