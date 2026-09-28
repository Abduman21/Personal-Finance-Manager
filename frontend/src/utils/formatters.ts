import { Currency } from '../types';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  ETB: 'Br',
};

export const formatCurrency = (amount: number, currency: Currency = 'USD'): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (currency === 'ETB') {
    return `${symbol} ${formattedNumber}`;
  }
  return `${symbol}${formattedNumber}`;
};

export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};
