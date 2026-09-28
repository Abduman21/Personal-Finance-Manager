import { Transaction } from '../models/Transaction';
import { BudgetService } from './budget.service';
import { SavingsGoal } from '../models/SavingsGoal';
import { RecurringTransaction } from '../models/RecurringTransaction';
import { Category } from '../models/Category';
import { Types } from 'mongoose';

export class ReportService {
  static getCurrentPeriodString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  static async getDashboardOverview(userId: Types.ObjectId | string) {
    const currentPeriod = this.getCurrentPeriodString();
    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const currentMonthEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

    // 1. All-time Totals (Balance)
    const allTimeStats = await Transaction.aggregate([
      { $match: { userId: new Types.ObjectId(userId.toString()) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    allTimeStats.forEach((stat) => {
      if (stat._id === 'income') totalIncome = stat.total;
      if (stat._id === 'expense') totalExpense = stat.total;
    });

    const totalBalance = totalIncome - totalExpense;

    // 2. Monthly Stats (Current Month)
    const monthlyStats = await Transaction.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId.toString()),
          date: { $gte: currentMonthStart, $lte: currentMonthEnd },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    monthlyStats.forEach((stat) => {
      if (stat._id === 'income') monthlyIncome = stat.total;
      if (stat._id === 'expense') monthlyExpenses = stat.total;
    });

    // 3. Savings Goal Total
    const savingsGoals = await SavingsGoal.find({ userId });
    const totalSavings = savingsGoals.reduce((acc, goal) => acc + goal.currentAmount, 0);

    // 4. Budgets Summary
    const budgets = await BudgetService.getBudgetsWithProgress(userId, currentPeriod);
    const budgetTotalAllocated = budgets.reduce((acc, b) => acc + b.amount, 0);
    const budgetTotalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
    const budgetRemaining = Math.max(0, budgetTotalAllocated - budgetTotalSpent);

    // 5. Recent 5 Transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .populate('categoryId');

    // 6. Upcoming Recurring Payments
    const upcomingRecurring = await RecurringTransaction.find({
      userId,
      isActive: true,
    })
      .sort({ nextDate: 1 })
      .limit(5)
      .populate('categoryId');

    // 7. Monthly Trend (Past 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const trendAgg = await Transaction.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId.toString()),
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyTrendMap: { [key: string]: { month: string; income: number; expense: number } } = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      monthlyTrendMap[key] = { month: monthLabel, income: 0, expense: 0 };
    }

    trendAgg.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (monthlyTrendMap[key]) {
        if (item._id.type === 'income') monthlyTrendMap[key].income = item.total;
        if (item._id.type === 'expense') monthlyTrendMap[key].expense = item.total;
      }
    });

    const monthlyTrend = Object.values(monthlyTrendMap);

    // 8. Expense Category Breakdown for Current Month
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId.toString()),
          type: 'expense',
          date: { $gte: currentMonthStart, $lte: currentMonthEnd },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categoryIds = categoryBreakdown.map((item) => item._id);
    const categories = await Category.find({ _id: { $in: categoryIds } });
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

    const categorySpending = categoryBreakdown.map((item) => {
      const cat = categoryMap.get(item._id.toString());
      return {
        categoryId: item._id,
        name: cat ? cat.name : 'Unknown',
        color: cat ? cat.color : '#9CA3AF',
        amount: item.total,
      };
    });

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      totalSavings,
      budgetRemaining,
      recentTransactions,
      upcomingRecurring,
      monthlyTrend,
      categorySpending,
      savingsGoals,
      budgets,
    };
  }

  static async getReports(
    userId: Types.ObjectId | string,
    options: { startDate?: string; endDate?: string; year?: number }
  ) {
    let startDate: Date;
    let endDate: Date;

    if (options.startDate && options.endDate) {
      startDate = new Date(options.startDate);
      endDate = new Date(options.endDate);
      if (options.endDate.length === 10) {
        endDate.setHours(23, 59, 59, 999);
      }
    } else if (options.year) {
      startDate = new Date(Date.UTC(options.year, 0, 1));
      endDate = new Date(Date.UTC(options.year, 11, 31, 23, 59, 59, 999));
    } else {
      // Default to current year
      const now = new Date();
      startDate = new Date(Date.UTC(now.getFullYear(), 0, 1));
      endDate = new Date(Date.UTC(now.getFullYear(), 11, 31, 23, 59, 59, 999));
    }

    const userObjId = new Types.ObjectId(userId.toString());

    // Category Spending
    const categorySpendingAgg = await Transaction.aggregate([
      {
        $match: {
          userId: userObjId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const catIds = categorySpendingAgg.map((item) => item._id);
    const categories = await Category.find({ _id: { $in: catIds } });
    const catMap = new Map(categories.map((c) => [c._id.toString(), c]));

    const categoryReport = categorySpendingAgg.map((item) => {
      const cat = catMap.get(item._id.toString());
      return {
        categoryId: item._id,
        name: cat ? cat.name : 'Unknown',
        icon: cat ? cat.icon : 'Tag',
        color: cat ? cat.color : '#9CA3AF',
        amount: item.total,
        count: item.count,
      };
    });

    // Monthly breakdown in date range
    const monthlyAgg = await Transaction.aggregate([
      {
        $match: {
          userId: userObjId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyReport: { [key: string]: { month: string; income: number; expense: number; net: number } } = {};
    monthlyAgg.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!monthlyReport[key]) {
        const d = new Date(item._id.year, item._id.month - 1);
        monthlyReport[key] = {
          month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
          income: 0,
          expense: 0,
          net: 0,
        };
      }
      if (item._id.type === 'income') monthlyReport[key].income = item.total;
      if (item._id.type === 'expense') monthlyReport[key].expense = item.total;
      monthlyReport[key].net = monthlyReport[key].income - monthlyReport[key].expense;
    });

    // Top Expense Categories
    const topExpenses = categoryReport.slice(0, 5);

    // Totals in range
    const totals = Object.values(monthlyReport).reduce(
      (acc, m) => {
        acc.income += m.income;
        acc.expense += m.expense;
        acc.net += m.net;
        return acc;
      },
      { income: 0, expense: 0, net: 0 }
    );

    return {
      totals,
      categoryReport,
      monthlyReport: Object.values(monthlyReport),
      topExpenses,
    };
  }
}
