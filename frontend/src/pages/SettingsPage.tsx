import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { authService } from '../services/auth.service';
import { formatDate } from '../utils/formatters';
import { Currency, Theme } from '../types';
import { User, Sun, Moon, DollarSign, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currency, setCurrencyState] = useState<Currency>(user?.currency || 'USD');
  const [selectedTheme, setSelectedThemeState] = useState<Theme>(user?.theme || theme || 'dark');

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await authService.updateProfile({
        fullName,
        currency,
        theme: selectedTheme,
      });

      updateUser(res.user);
      setTheme(selectedTheme);
      setSuccessMsg('Profile and preferences updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update preferences.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Account Settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal profile, preferred currency display, and dark/light appearance
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </span>
          <button onClick={() => setSuccessMsg('')} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" /> Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={user?.email || ''}
              disabled
              helperText="Email address cannot be changed"
            />
          </div>

          <div className="text-xs text-slate-400 pt-2">
            Member joined since: <strong className="text-slate-200">{formatDate(user?.createdAt || new Date())}</strong>
          </div>
        </Card>

        {/* Financial & Regional Preferences */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" /> Currency & Regional Settings
          </h3>

          <div className="max-w-md">
            <Select
              label="Preferred Display Currency"
              value={currency}
              onChange={(e) => setCurrencyState(e.target.value as Currency)}
              options={[
                { value: 'USD', label: 'USD ($) - US Dollar' },
                { value: 'EUR', label: 'EUR (€) - Euro' },
                { value: 'GBP', label: 'GBP (£) - British Pound' },
                { value: 'ETB', label: 'ETB (Br) - Ethiopian Birr' },
              ]}
            />
          </div>
        </Card>

        {/* Appearance & Theme */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Appearance & Theme
          </h3>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              type="button"
              onClick={() => setSelectedThemeState('dark')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                selectedTheme === 'dark'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold shadow-md'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="text-xs">Dark Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedThemeState('light')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                selectedTheme === 'light'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold shadow-md'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="text-xs">Light Mode</span>
            </button>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isLoading} size="lg">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
