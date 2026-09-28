import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Category, Transaction } from '../../types';
import { categoryService } from '../../services/category.service';
import { transactionService } from '../../services/transaction.service';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: 'income' | 'expense';
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'expense',
  initialData = null,
}) => {
  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      categoryService.getCategories().then((res) => {
        setCategories(res.categories);
      });

      if (initialData) {
        setType(initialData.type);
        setAmount(String(initialData.amount));
        const catId = typeof initialData.categoryId === 'object' ? initialData.categoryId._id : initialData.categoryId;
        setCategoryId(catId || '');
        setDate(new Date(initialData.date).toISOString().slice(0, 10));
        setDescription(initialData.description);
        setMerchant(initialData.merchant || '');
        setNotes(initialData.notes || '');
      } else {
        setType(defaultType);
        setAmount('');
        setCategoryId('');
        setDate(new Date().toISOString().slice(0, 10));
        setDescription('');
        setMerchant('');
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, initialData, defaultType]);

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0]._id);
    }
  }, [filteredCategories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        type,
        amount: parsedAmount,
        categoryId,
        date: new Date(date),
        description,
        merchant: merchant || undefined,
        notes: notes || undefined,
      };

      if (initialData) {
        await transactionService.update(initialData._id, payload);
      } else {
        await transactionService.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Type selector tabs */}
        {!initialData && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Income
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={filteredCategories.map((c) => ({ value: c._id, label: c.name }))}
            required
          />
        </div>

        <Input
          label="Description"
          type="text"
          placeholder="e.g. Weekly Groceries"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Transaction Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Input
            label="Merchant / Source (Optional)"
            type="text"
            placeholder="e.g. Walmart or Employer"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>

        <Input
          label="Notes (Optional)"
          type="text"
          placeholder="Additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
