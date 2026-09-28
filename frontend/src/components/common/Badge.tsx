import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'income' | 'expense' | 'info' | 'warning' | 'neutral';
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', color }) => {
  if (color) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: `${color}20`,
          color: color,
          border: `1px solid ${color}40`,
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        {children}
      </span>
    );
  }

  const variants = {
    income: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 dark:bg-emerald-500/20',
    expense: 'bg-rose-500/10 text-rose-500 border border-rose-500/30 dark:bg-rose-500/20',
    info: 'bg-blue-500/10 text-blue-500 border border-blue-500/30 dark:bg-blue-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/30 dark:bg-amber-500/20',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
};
