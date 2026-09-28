import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WidgetProps {
  transactions: Transaction[];
}

export const RecentTransactionsWidget: React.FC<WidgetProps> = ({ transactions }) => {
  const { currency } = useAuth();

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Latest financial activities</p>
        </div>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 hover:underline"
        >
          View all
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No transactions yet. Add income or expenses to see them here!
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {transactions.map((t) => {
            const isIncome = t.type === 'income';
            const categoryObj = typeof t.categoryId === 'object' ? t.categoryId : null;

            return (
              <div key={t._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}
                  >
                    {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {t.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{formatDate(t.date)}</span>
                      {categoryObj && (
                        <>
                          <span>•</span>
                          <Badge color={categoryObj.color}>{categoryObj.name}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold shrink-0 ${
                    isIncome ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {isIncome ? '+' : '-'}{formatCurrency(t.amount, currency)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
