import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Category, RecurringTransaction } from '../../types';
import { categoryService } from '../../services/category.service';
import { recurringService } from '../../services/recurring.service';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: RecurringTransaction | null;
}

export const RecurringModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [nextDate, setNextDate] = useState(new Date().toISOString().slice(0, 10));
  const [isActive, setIsActive] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      categoryService.getCategories().then((res) => {
        setCategories(res.categories);
      });

      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setAmount(String(initialData.amount));
        const catId = typeof initialData.categoryId === 'object' ? initialData.categoryId._id : initialData.categoryId;
        setCategoryId(catId || '');
        setFrequency(initialData.frequency);
        setNextDate(new Date(initialData.nextDate).toISOString().slice(0, 10));
        setIsActive(initialData.isActive);
      } else {
        setName('');
        setType('expense');
        setAmount('');
        setCategoryId('');
        setFrequency('monthly');
        setNextDate(new Date().toISOString().slice(0, 10));
        setIsActive(true);
      }
      setError('');
    }
  }, [isOpen, initialData]);

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
      setError('Please enter a valid amount.');
      return;
    }

    if (!name.trim()) {
      setError('Transaction name is required.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name,
        type,
        amount: parsedAmount,
        categoryId,
        frequency,
        nextDate: new Date(nextDate),
        isActive,
      };

      if (initialData) {
        await recurringService.update(initialData._id, payload);
      } else {
        await recurringService.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save recurring transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Recurring Payment' : 'Schedule Recurring Transaction'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <Input
          label="Name"
          type="text"
          placeholder="e.g. Netflix Subscription or Rent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as any);
              setCategoryId('');
            }}
            options={[
              { value: 'expense', label: 'Recurring Expense' },
              { value: 'income', label: 'Recurring Income' },
            ]}
          />

          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={filteredCategories.map((c) => ({ value: c._id, label: c.name }))}
            required
          />

          <Select
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Next Execution Date"
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            required
          />

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer pb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500"
              />
              Enable Active Auto-processing
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Recurring'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
