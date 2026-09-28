import React, { useEffect, useState } from 'react';
import { recurringService } from '../services/recurring.service';
import { RecurringTransaction } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';
import { RecurringModal } from '../features/recurring/RecurringModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Repeat, Play, Calendar, CheckCircle2 } from 'lucide-react';

export const RecurringPage: React.FC = () => {
  const { currency } = useAuth();
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMsg, setProcessMsg] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRecurring = async () => {
    try {
      setIsLoading(true);
      const res = await recurringService.getRecurring();
      setRecurring(res.recurring);
    } catch (err) {
      console.error('Failed to load recurring transactions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const handleProcessDue = async () => {
    try {
      setIsProcessing(true);
      setProcessMsg('');
      const res = await recurringService.processDue();
      setProcessMsg(res.message);
      fetchRecurring();
    } catch (err: any) {
      setProcessMsg(err.message || 'Failed to process due recurring items.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await recurringService.delete(deleteTargetId);
      setDeleteTargetId(null);
      fetchRecurring();
    } catch (err) {
      console.error('Delete recurring item failed', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recurring Payments & Subscriptions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automate weekly, monthly, and yearly income or expenses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleProcessDue}
            variant="secondary"
            isLoading={isProcessing}
            icon={<Play className="w-4 h-4 fill-emerald-500 text-emerald-500" />}
          >
            Process Due Payments
          </Button>
          <Button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Schedule Recurring
          </Button>
        </div>
      </div>

      {processMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {processMsg}
          </span>
          <button onClick={() => setProcessMsg('')} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : recurring.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Repeat className="w-8 h-8" />}
            title="No recurring transactions"
            description="Schedule repeating salary, rent, or subscriptions so you never miss a payment."
            actionLabel="Schedule Recurring"
            onAction={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurring.map((item) => {
            const isIncome = item.type === 'income';
            const catObj = typeof item.categoryId === 'object' ? item.categoryId : null;

            return (
              <Card key={item._id} className="flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </h3>
                      <Badge variant={isIncome ? 'income' : 'expense'}>
                        {item.frequency}
                      </Badge>
                    </div>
                    {catObj && (
                      <div className="mt-1">
                        <Badge color={catObj.color}>{catObj.name}</Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(item._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <div
                    className={`text-xl font-black ${
                      isIncome ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(item.amount, currency)}
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      item.isActive
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Next: <strong className="text-slate-900 dark:text-slate-100">{formatDate(item.nextDate)}</strong>
                  </span>
                  {item.lastProcessedDate && (
                    <span className="text-[10px] text-slate-400">
                      Last: {formatDate(item.lastProcessedDate)}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <RecurringModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={fetchRecurring}
        initialData={editingItem}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Recurring Schedule"
        message="Are you sure you want to stop and delete this recurring payment schedule?"
        isLoading={isDeleting}
      />
    </div>
  );
};
