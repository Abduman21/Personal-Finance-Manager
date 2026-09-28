export const convertTransactionsToCSV = (transactions: any[]): string => {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Merchant', 'Amount', 'Notes'];

  const rows = transactions.map((t) => {
    const date = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
    const type = t.type || '';
    const category = t.categoryId?.name || t.category || '';
    const description = `"${(t.description || '').replace(/"/g, '""')}"`;
    const merchant = `"${(t.merchant || '').replace(/"/g, '""')}"`;
    const amount = t.amount || 0;
    const notes = `"${(t.notes || '').replace(/"/g, '""')}"`;

    return [date, type, category, description, merchant, amount, notes].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};
