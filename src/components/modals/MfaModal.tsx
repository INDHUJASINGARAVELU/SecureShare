import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, KeyRound, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MfaModal: React.FC = () => {
  const { isMfaModalOpen, closeMfaModal, verifyMfaCode, currentUser } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  if (!isMfaModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyMfaCode(code)) {
      setError(false);
      setCode('');
    } else {
      setError(true);
    }
  };

  const handleUseDemoCode = () => {
    setCode('123456');
    setError(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeMfaModal}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-10"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-500/20 shadow-inner">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Simulated MFA Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AWS Virtual MFA Device (TOTP Simulation)
                </p>
              </div>
            </div>
            <button
              onClick={closeMfaModal}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
            <p className="font-semibold">Demonstration Notice:</p>
            <p className="mt-0.5">
              Role <strong className="font-semibold uppercase">{currentUser.role.replace('_', ' ')}</strong> requires MFA enforcement under the simulated IAM security baseline. Enter any 6-digit code or click below to autofill.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                6-Digit Authenticator Code
              </label>
              <div className="mt-1.5 relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={e => {
                    setCode(e.target.value.replace(/\D/g, ''));
                    if (error) setError(false);
                  }}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-center text-lg font-mono tracking-widest text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Please enter a valid 6-digit code.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleUseDemoCode}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 underline underline-offset-2"
              >
                Use Demo Code (123456)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeMfaModal}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
                >
                  Verify MFA
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
