import { SavingsGoal, ISavingsGoal } from '../models/SavingsGoal';
import { Types } from 'mongoose';

export class SavingsService {
  static async getAll(userId: Types.ObjectId | string): Promise<ISavingsGoal[]> {
    return SavingsGoal.find({ userId }).sort({ targetDate: 1 });
  }

  static async create(
    userId: Types.ObjectId | string,
    data: {
      name: string;
      targetAmount: number;
      currentAmount?: number;
      targetDate: Date;
      description?: string;
    }
  ): Promise<ISavingsGoal> {
    const isCompleted = (data.currentAmount || 0) >= data.targetAmount;
    const goal = new SavingsGoal({
      ...data,
      userId,
      isCompleted,
    });
    return goal.save();
  }

  static async update(
    userId: Types.ObjectId | string,
    goalId: string,
    data: Partial<ISavingsGoal>
  ): Promise<ISavingsGoal | null> {
    const existing = await SavingsGoal.findOne({ _id: goalId, userId });
    if (!existing) return null;

    const newTarget = data.targetAmount !== undefined ? data.targetAmount : existing.targetAmount;
    const newCurrent = data.currentAmount !== undefined ? data.currentAmount : existing.currentAmount;

    const isCompleted = newCurrent >= newTarget;

    return SavingsGoal.findOneAndUpdate(
      { _id: goalId, userId },
      { $set: { ...data, isCompleted } },
      { new: true, runValidators: true }
    );
  }

  static async contribute(
    userId: Types.ObjectId | string,
    goalId: string,
    amount: number
  ): Promise<ISavingsGoal | null> {
    const goal = await SavingsGoal.findOne({ _id: goalId, userId });
    if (!goal) {
      throw new Error('Savings goal not found.');
    }

    const updatedCurrent = goal.currentAmount + amount;
    const isCompleted = updatedCurrent >= goal.targetAmount;

    goal.currentAmount = updatedCurrent;
    goal.isCompleted = isCompleted;

    return goal.save();
  }

  static async delete(userId: Types.ObjectId | string, goalId: string): Promise<boolean> {
    const res = await SavingsGoal.deleteOne({ _id: goalId, userId });
    return res.deletedCount > 0;
  }
}
