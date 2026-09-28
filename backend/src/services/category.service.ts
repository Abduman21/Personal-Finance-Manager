import { Category, ICategory } from '../models/Category';
import { Transaction } from '../models/Transaction';
import { Types } from 'mongoose';

export const DEFAULT_CATEGORIES = [
  // Income categories
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10B981' },
  { name: 'Freelance', type: 'income', icon: 'Laptop', color: '#3B82F6' },
  { name: 'Business', type: 'income', icon: 'Building', color: '#8B5CF6' },
  { name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#06B6D4' },
  { name: 'Gift', type: 'income', icon: 'Gift', color: '#EC4899' },
  { name: 'Other Income', type: 'income', icon: 'DollarSign', color: '#6B7280' },

  // Expense categories
  { name: 'Housing', type: 'expense', icon: 'Home', color: '#F59E0B' },
  { name: 'Food', type: 'expense', icon: 'Utensils', color: '#EF4444' },
  { name: 'Transportation', type: 'expense', icon: 'Car', color: '#3B82F6' },
  { name: 'Utilities', type: 'expense', icon: 'Zap', color: '#10B981' },
  { name: 'Health', type: 'expense', icon: 'HeartPulse', color: '#EC4899' },
  { name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#8B5CF6' },
  { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#6366F1' },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#F43F5E' },
  { name: 'Travel', type: 'expense', icon: 'Plane', color: '#14B8A6' },
  { name: 'Other', type: 'expense', icon: 'Tag', color: '#9CA3AF' },
];

export class CategoryService {
  static async seedDefaults(userId: Types.ObjectId | string): Promise<ICategory[]> {
    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const categoriesToInsert = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      userId: userObjId,
      isDefault: true,
    }));

    return Category.insertMany(categoriesToInsert) as unknown as ICategory[];
  }

  static async getUserCategories(userId: Types.ObjectId | string): Promise<ICategory[]> {
    return Category.find({ userId }).sort({ type: 1, name: 1 });
  }

  static async createCategory(
    userId: Types.ObjectId | string,
    data: { name: string; type: 'income' | 'expense'; icon?: string; color?: string }
  ): Promise<ICategory> {
    const category = new Category({
      ...data,
      userId,
      isDefault: false,
    });
    return category.save();
  }

  static async updateCategory(
    userId: Types.ObjectId | string,
    categoryId: string,
    data: Partial<{ name: string; icon: string; color: string }>
  ): Promise<ICategory | null> {
    return Category.findOneAndUpdate(
      { _id: categoryId, userId },
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  static async deleteCategory(
    userId: Types.ObjectId | string,
    categoryId: string
  ): Promise<{ success: boolean; message?: string }> {
    // Check if category is used in any transactions
    const transactionCount = await Transaction.countDocuments({ categoryId, userId });
    if (transactionCount > 0) {
      return {
        success: false,
        message: `Cannot delete category because it is associated with ${transactionCount} transaction(s).`,
      };
    }

    const result = await Category.deleteOne({ _id: categoryId, userId });
    if (result.deletedCount === 0) {
      return { success: false, message: 'Category not found.' };
    }

    return { success: true };
  }
}
