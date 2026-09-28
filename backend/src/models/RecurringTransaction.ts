import { Schema, model, Document, Types } from 'mongoose';

export interface IRecurringTransaction extends Document {
  userId: Types.ObjectId;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: Types.ObjectId;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDate: Date;
  isActive: boolean;
  lastProcessedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringTransactionSchema = new Schema<IRecurringTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Transaction name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      required: true,
    },
    nextDate: {
      type: Date,
      required: [true, 'Next execution date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastProcessedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

RecurringTransactionSchema.index({ userId: 1, isActive: 1 });
RecurringTransactionSchema.index({ nextDate: 1, isActive: 1 });

export const RecurringTransaction = model<IRecurringTransaction>(
  'RecurringTransaction',
  RecurringTransactionSchema
);
