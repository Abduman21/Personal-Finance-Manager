import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Category, Budget } from '../../types';
import { categoryService } from '../../services/category.service';
import { budgetService } from '../../services/budget.service';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Budget | null;
  defaultPeriod?: string;
}

export const BudgetModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  defaultPeriod,
}) => {
  const currentPeriodString = defaultPeriod || new Date().toISOString().slice(0, 7);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [period, setPeriod] = useState(currentPeriodString);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      categoryService.getCategories().then((res) => {
        setCategories(res.categories.filter((c) => c.type === 'expense'));
      });

      if (initialData) {
        setName(initialData.name);
        setAmount(String(initialData.amount));
        const catId = typeof initialData.categoryId === 'object' ? initialData.categoryId?._id : initialData.categoryId;
        setCategoryId(catId || '');
        setPeriod(initialData.period);
      } else {
        setName('');
        setAmount('');
        setCategoryId('');
        setPeriod(currentPeriodString);
      }
      setError('');
    }
  }, [isOpen, initialData, currentPeriodString]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive budget amount.');
      return;
    }

    if (!name.trim()) {
      setError('Budget name is required.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name,
        amount: parsedAmount,
        categoryId: categoryId || null,
        period,
      };

      if (initialData) {
        await budgetService.update(initialData._id, payload);
      } else {
        await budgetService.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Budget' : 'Create Monthly Budget'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <Input
          label="Budget Name"
          type="text"
          placeholder="e.g. Dining & Groceries"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Allocated Amount"
          type="number"
          step="0.01"
          placeholder="500.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <Select
          label="Category (Optional)"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={[
            { value: '', label: 'Overall Monthly Budget (All Categories)' },
            ...categories.map((c) => ({ value: c._id, label: c.name })),
          ]}
        />

        <Input
          label="Target Month Period"
          type="month"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Save Budget' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
