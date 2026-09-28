import React from 'react';
import { Card } from '../../components/common/Card';
import { RecurringTransaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WidgetProps {
  recurring: RecurringTransaction[];
}

export const UpcomingRecurringWidget: React.FC<WidgetProps> = ({ recurring }) => {
  const { currency } = useAuth();

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Recurring</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled automated payments</p>
        </div>
        <Link
          to="/recurring"
          className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 hover:underline"
        >
          View all
        </Link>
      </div>

      {recurring.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No active recurring transactions scheduled.
        </div>
      ) : (
        <div className="space-y-2.5">
          {recurring.slice(0, 3).map((item) => {
            const isIncome = item.type === 'income';

            return (
              <div
                key={item._id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Due {formatDate(item.nextDate)} ({item.frequency})
                    </p>
                  </div>
                </div>
                <div
                  className={`text-xs font-bold ${
                    isIncome ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {isIncome ? '+' : '-'}{formatCurrency(item.amount, currency)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
