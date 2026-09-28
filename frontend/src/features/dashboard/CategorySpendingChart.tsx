import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../../components/common/Card';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface CategorySpendingProps {
  data: { categoryId: string; name: string; color: string; amount: number }[];
}

export const CategorySpendingChart: React.FC<CategorySpendingProps> = ({ data }) => {
  const { currency } = useAuth();

  const totalSpent = data.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Card className="flex flex-col h-[340px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Expense Breakdown</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Current month spending by category</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
          No expenses recorded this month
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 min-h-0">
          <div className="w-full h-44 md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full md:w-1/2 max-h-40 overflow-y-auto space-y-2 pr-1">
            {data.slice(0, 6).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color || '#10b981' }}
                  />
                  <span className="text-slate-700 dark:text-slate-300 truncate font-medium">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white shrink-0">
                  <span>{formatCurrency(item.amount, currency)}</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    ({totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
