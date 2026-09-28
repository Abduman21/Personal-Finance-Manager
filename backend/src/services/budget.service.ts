import { Budget, IBudget } from '../models/Budget';
import { Transaction } from '../models/Transaction';
import { Types } from 'mongoose';

export interface BudgetWithProgress extends IBudget {
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
}

export class BudgetService {
  static async getBudgetsWithProgress(
    userId: Types.ObjectId | string,
    period: string
  ): Promise<BudgetWithProgress[]> {
    const userObjId = new Types.ObjectId(userId.toString());
    const budgets = await Budget.find({ userId: userObjId, period }).populate('categoryId');

    const year = parseInt(period.split('-')[0], 10);
    const month = parseInt(period.split('-')[1], 10) - 1; // 0-indexed

    const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    const results: BudgetWithProgress[] = [];

    for (const budget of budgets) {
      const query: any = {
        userId: userObjId,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate },
      };

      if (budget.categoryId) {
        const catId = (budget.categoryId as any)._id || budget.categoryId;
        query.categoryId = new Types.ObjectId(catId.toString());
      }

      const aggregateResult = await Transaction.aggregate([
        { $match: query },
        { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
      ]);

      const spentAmount = aggregateResult.length > 0 ? aggregateResult[0].totalSpent : 0;
      const remainingAmount = Math.max(0, budget.amount - spentAmount);
      const percentageUsed = budget.amount > 0 ? Math.round((spentAmount / budget.amount) * 100) : 0;

      const budgetObj = budget.toObject() as unknown as BudgetWithProgress;
      budgetObj.spentAmount = spentAmount;
      budgetObj.remainingAmount = remainingAmount;
      budgetObj.percentageUsed = percentageUsed;

      results.push(budgetObj);
    }

    return results;
  }

  static async create(
    userId: Types.ObjectId | string,
    data: { name: string; amount: number; categoryId?: string | null; period: string }
  ): Promise<IBudget> {
    const existing = await Budget.findOne({
      userId,
      period: data.period,
      categoryId: data.categoryId || null,
    });

    if (existing) {
      throw new Error('A budget already exists for this category and period.');
    }

    const budget = new Budget({
      ...data,
      userId,
      categoryId: data.categoryId || null,
    });

    await budget.save();
    return budget.populate('categoryId');
  }

  static async update(
    userId: Types.ObjectId | string,
    budgetId: string,
    data: Partial<{ name: string; amount: number; categoryId: string | null; period: string }>
  ): Promise<IBudget | null> {
    return Budget.findOneAndUpdate(
      { _id: budgetId, userId },
      { $set: data },
      { new: true, runValidators: true }
    ).populate('categoryId');
  }

  static async delete(userId: Types.ObjectId | string, budgetId: string): Promise<boolean> {
    const res = await Budget.deleteOne({ _id: budgetId, userId });
    return res.deletedCount > 0;
  }
}
