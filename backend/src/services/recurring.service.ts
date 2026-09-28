import { RecurringTransaction, IRecurringTransaction } from '../models/RecurringTransaction';
import { Transaction } from '../models/Transaction';
import { Types } from 'mongoose';

export class RecurringService {
  static async getAll(userId: Types.ObjectId | string): Promise<IRecurringTransaction[]> {
    return RecurringTransaction.find({ userId })
      .sort({ nextDate: 1 })
      .populate('categoryId');
  }

  static async create(
    userId: Types.ObjectId | string,
    data: {
      name: string;
      type: 'income' | 'expense';
      amount: number;
      categoryId: string;
      frequency: 'weekly' | 'monthly' | 'yearly';
      nextDate: Date;
      isActive?: boolean;
    }
  ): Promise<IRecurringTransaction> {
    const item = new RecurringTransaction({
      ...data,
      userId,
    });
    await item.save();
    return item.populate('categoryId');
  }

  static async update(
    userId: Types.ObjectId | string,
    id: string,
    data: Partial<IRecurringTransaction>
  ): Promise<IRecurringTransaction | null> {
    return RecurringTransaction.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true, runValidators: true }
    ).populate('categoryId');
  }

  static async delete(userId: Types.ObjectId | string, id: string): Promise<boolean> {
    const res = await RecurringTransaction.deleteOne({ _id: id, userId });
    return res.deletedCount > 0;
  }

  static calculateNextDate(currentNextDate: Date, frequency: 'weekly' | 'monthly' | 'yearly'): Date {
    const date = new Date(currentNextDate);
    if (frequency === 'weekly') {
      date.setDate(date.getDate() + 7);
    } else if (frequency === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (frequency === 'yearly') {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date;
  }

  static async processDue(userId: Types.ObjectId | string): Promise<{ processedCount: number }> {
    const now = new Date();
    const dueItems = await RecurringTransaction.find({
      userId,
      isActive: true,
      nextDate: { $lte: now },
    });

    let processedCount = 0;

    for (const item of dueItems) {
      // Create actual transaction
      const transaction = new Transaction({
        userId: item.userId,
        type: item.type,
        amount: item.amount,
        categoryId: item.categoryId,
        date: item.nextDate,
        description: `[Recurring] ${item.name}`,
        notes: `Automatically generated from recurring payment (${item.frequency}).`,
        recurringId: item._id,
      });

      await transaction.save();

      // Update nextDate and lastProcessedDate
      item.lastProcessedDate = now;
      item.nextDate = this.calculateNextDate(item.nextDate, item.frequency);
      await item.save();

      processedCount++;
    }

    return { processedCount };
  }
}
