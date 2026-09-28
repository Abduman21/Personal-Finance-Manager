import { z } from 'zod';

// Auth Validation Schemas
export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Category Schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  type: z.enum(['income', 'expense']),
  icon: z.string().optional().default('Tag'),
  color: z.string().optional().default('#10B981'),
});

export const updateCategorySchema = createCategorySchema.partial();

// Transaction Schemas
export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be greater than 0'),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  date: z.string().or(z.date()).transform((val) => new Date(val)),
  description: z.string().min(1, 'Description is required').max(200),
  merchant: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

// Budget Schemas
export const createBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100),
  amount: z.number().positive('Budget amount must be positive'),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID').optional().nullable(),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be format YYYY-MM'),
});

export const updateBudgetSchema = createBudgetSchema.partial();

// Savings Goal Schemas
export const createSavingsGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0, 'Current amount cannot be negative').optional().default(0),
  targetDate: z.string().or(z.date()).transform((val) => new Date(val)),
  description: z.string().max(500).optional(),
});

export const updateSavingsGoalSchema = createSavingsGoalSchema.partial();

export const contributeSavingsGoalSchema = z.object({
  amount: z.number().positive('Contribution amount must be positive'),
});

// Recurring Transaction Schemas
export const createRecurringSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  nextDate: z.string().or(z.date()).transform((val) => new Date(val)),
  isActive: z.boolean().optional().default(true),
});

export const updateRecurringSchema = createRecurringSchema.partial();

// Profile & Settings Schemas
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'ETB']).optional(),
  theme: z.enum(['dark', 'light']).optional(),
});
