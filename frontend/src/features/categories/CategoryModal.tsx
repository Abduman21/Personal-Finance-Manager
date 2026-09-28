import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Category } from '../../types';
import { categoryService } from '../../services/category.service';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Category | null;
}

const PRESET_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#06B6D4', '#6366F1', '#F43F5E', '#14B8A6',
];

export const CategoryModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('Tag');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setColor(initialData.color);
        setIcon(initialData.icon);
      } else {
        setName('');
        setType('expense');
        setColor('#10B981');
        setIcon('Tag');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = { name, type, color, icon };
      if (initialData) {
        await categoryService.update(initialData._id, payload);
      } else {
        await categoryService.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Category' : 'Create Custom Category'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <Input
          label="Category Name"
          type="text"
          placeholder="e.g. Subscriptions"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          label="Category Type"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          options={[
            { value: 'expense', label: 'Expense Category' },
            { value: 'income', label: 'Income Category' },
          ]}
          disabled={!!initialData}
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Badge Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-all border-2 ${
                  color === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Save Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
