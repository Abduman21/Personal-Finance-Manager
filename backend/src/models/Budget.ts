import { Schema, model, Document, Types } from 'mongoose';

export interface IBudget extends Document {
  userId: Types.ObjectId;
  name: string;
  amount: number;
  categoryId?: Types.ObjectId;
  period: string; // 'YYYY-MM'
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Budget name is required'],
      trim: true,
      maxlength: [100, 'Budget name cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    period: {
      type: String,
      required: [true, 'Budget period (YYYY-MM) is required'],
      match: [/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

BudgetSchema.index({ userId: 1, period: 1 });
BudgetSchema.index({ userId: 1, categoryId: 1, period: 1 }, { unique: true });

export const Budget = model<IBudget>('Budget', BudgetSchema);
