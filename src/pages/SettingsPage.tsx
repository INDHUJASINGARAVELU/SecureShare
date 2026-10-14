import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Clock,
  Bell,
  Sun,
  Moon,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData, clearLocalData } = useApp();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(settings.displayName);
  const [email, setEmail] = useState(settings.email);
  const [defaultExpiry, setDefaultExpiry] = useState<5 | 10 | 15>(settings.defaultExpiryMinutes);
  const [emailAlerts, setEmailAlerts] = useState(settings.emailAlertsEnabled);
  const [compactTables, setCompactTables] = useState(settings.compactTableView);
  const [simulationWatermark, setSimulationWatermark] = useState(settings.simulationWatermark);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      displayName,
      email,
      defaultExpiryMinutes: defaultExpiry,
      emailAlertsEnabled: emailAlerts,
      compactTableView: compactTables,
      simulationWatermark,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Preferences & Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure demonstration settings, link lifecycle constraints, and localStorage persistence.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Preferences saved to browser localStorage.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Demonstration Identity Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Link Lifecycle Policies */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Clock className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Presigned Link Expiration Policies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default Expiration Duration
              </label>
              <select
                value={defaultExpiry}
                onChange={e => setDefaultExpiry(Number(e.target.value) as any)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Preselected expiration for newly generated presigned URLs.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Maximum Allowed Expiration Policy
              </label>
              <input
                type="text"
                disabled
                value="15 Minutes (Strict Security Ceiling)"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 cursor-not-allowed font-medium"
              />
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                Locked by project security specification.
              </p>
            </div>
          </div>
        </div>

        {/* Display & Visual Preferences */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sun className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Appearance & Interface Preferences
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Color Theme Mode
                </p>
                <p className="text-[11px] text-slate-400">
                  Select between light mode and dark cybersecurity dashboard theme.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium border ${
                    theme === 'light'
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium border ${
                    theme === 'dark'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Simulation Notice Watermark Banner
                </p>
                <p className="text-[11px] text-slate-400">
                  Display the top banner identifying that AWS S3 and KMS are simulated.
                </p>
              </div>

              <input
                type="checkbox"
                checked={simulationWatermark}
                onChange={e => setSimulationWatermark(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            Save All Preferences
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset & Clear Local Data */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 shadow-sm dark:border-rose-950 dark:bg-rose-950/20 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            Demonstration State Reset & Sandbox Purge
          </h2>
          <p className="text-xs text-rose-700/80 dark:text-rose-400/80 mt-0.5">
            Reset all files, links, audit events, and test records to initial baseline state.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Initial Mock Data</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Entire Local Storage</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Demo Environment"
        message="This will restore all files, share links, audit logs, and security checklist items to their initial presentation state. Continue?"
        confirmLabel="Reset Everything"
        variant="danger"
        onConfirm={() => {
          resetDemoData();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Local Storage"
        message="This will wipe all locally stored mock data completely. The application will start clean."
        confirmLabel="Clear Data"
        variant="danger"
        onConfirm={() => {
          clearLocalData();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
