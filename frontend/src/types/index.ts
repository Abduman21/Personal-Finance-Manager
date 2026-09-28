export type Currency = 'USD' | 'EUR' | 'GBP' | 'ETB';
export type Theme = 'dark' | 'light';

export interface User {
  id: string;
  fullName: string;
  email: string;
  currency: Currency;
  theme: Theme;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: Category | string;
  date: string;
  description: string;
  merchant?: string;
  notes?: string;
  recurringId?: string;
  createdAt?: string;
}

export interface Budget {
  _id: string;
  name: string;
  amount: number;
  categoryId?: Category | string | null;
  period: string;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
}

export interface SavingsGoal {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description?: string;
  isCompleted: boolean;
}

export interface RecurringTransaction {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: Category | string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  isActive: boolean;
  lastProcessedDate?: string;
}

export interface DashboardOverview {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  budgetRemaining: number;
  recentTransactions: Transaction[];
  upcomingRecurring: RecurringTransaction[];
  monthlyTrend: { month: string; income: number; expense: number }[];
  categorySpending: { categoryId: string; name: string; color: string; amount: number }[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
}

export interface DetailedReports {
  totals: { income: number; expense: number; net: number };
  categoryReport: { categoryId: string; name: string; icon: string; color: string; amount: number; count: number }[];
  monthlyReport: { month: string; income: number; expense: number; net: number }[];
  topExpenses: { categoryId: string; name: string; icon: string; color: string; amount: number; count: number }[];
}
