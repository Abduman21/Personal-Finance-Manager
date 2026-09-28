import { Transaction, ITransaction } from '../models/Transaction';
import { Category } from '../models/Category';
import { Types } from 'mongoose';

export interface FilterOptions {
  type?: 'income' | 'expense';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class TransactionService {
  static async create(
    userId: Types.ObjectId | string,
    data: {
      type: 'income' | 'expense';
      amount: number;
      categoryId: string;
      date: Date;
      description: string;
      merchant?: string;
      notes?: string;
      recurringId?: string;
    }
  ): Promise<ITransaction> {
    // Verify category belongs to user or is default
    const category = await Category.findOne({ _id: data.categoryId, userId });
    if (!category) {
      throw new Error('Selected category is invalid or does not belong to user.');
    }

    const transaction = new Transaction({
      ...data,
      userId,
    });

    await transaction.save();
    return transaction.populate('categoryId');
  }

  static async getFiltered(
    userId: Types.ObjectId | string,
    filters: FilterOptions = {}
  ): Promise<{ transactions: ITransaction[]; total: number; page: number; pages: number }> {
    const query: any = { userId };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.categoryId) {
      query.categoryId = filters.categoryId;
    }

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        // Set to end of day if date string only
        const end = new Date(filters.endDate);
        if (filters.endDate.length === 10) {
          end.setHours(23, 59, 59, 999);
        }
        query.date.$lte = end;
      }
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      query.amount = {};
      if (filters.minAmount !== undefined) query.amount.$gte = filters.minAmount;
      if (filters.maxAmount !== undefined) query.amount.$lte = filters.maxAmount;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { description: searchRegex },
        { merchant: searchRegex },
        { notes: searchRegex },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const sortField = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortOrder };

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('categoryId'),
      Transaction.countDocuments(query),
    ]);

    return {
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  static async getById(userId: Types.ObjectId | string, transactionId: string): Promise<ITransaction | null> {
    return Transaction.findOne({ _id: transactionId, userId }).populate('categoryId');
  }

  static async update(
    userId: Types.ObjectId | string,
    transactionId: string,
    data: Partial<ITransaction>
  ): Promise<ITransaction | null> {
    if (data.categoryId) {
      const category = await Category.findOne({ _id: data.categoryId, userId });
      if (!category) {
        throw new Error('Selected category is invalid or does not belong to user.');
      }
    }

    return Transaction.findOneAndUpdate(
      { _id: transactionId, userId },
      { $set: data },
      { new: true, runValidators: true }
    ).populate('categoryId');
  }

  static async delete(userId: Types.ObjectId | string, transactionId: string): Promise<boolean> {
    const res = await Transaction.deleteOne({ _id: transactionId, userId });
    return res.deletedCount > 0;
  }

  static async getAllForExport(userId: Types.ObjectId | string, filters: FilterOptions = {}): Promise<ITransaction[]> {
    const { transactions } = await this.getFiltered(userId, { ...filters, limit: 10000, page: 1 });
    return transactions;
  }
}
