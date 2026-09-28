import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { SavingsGoal } from '../../types';
import { savingsService } from '../../services/savings.service';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: SavingsGoal | null;
}

export const ContributionModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  goal,
}) => {
  const { currency } = useAuth();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid contribution amount.');
      return;
    }

    setIsLoading(true);

    try {
      await savingsService.contribute(goal._id, parsed);
      onSuccess();
      onClose();
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to add contribution');
    } finally {
      setIsLoading(false);
    }
  };

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Contribution to "${goal.name}"`} maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs space-y-1">
          <div className="flex justify-between text-slate-500">
            <span>Target Goal:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatCurrency(goal.targetAmount, currency)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Saved So Far:</span>
            <span className="font-bold text-emerald-500">
              {formatCurrency(goal.currentAmount, currency)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Remaining Needed:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatCurrency(remaining, currency)}
            </span>
          </div>
        </div>

        <Input
          label="Deposit Amount"
          type="number"
          step="0.01"
          placeholder="e.g. 100.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Add Contribution
          </Button>
        </div>
      </form>
    </Modal>
  );
};
