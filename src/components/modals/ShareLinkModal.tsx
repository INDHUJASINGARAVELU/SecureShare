import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  X,
  Clock,
  User,
  Mail,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { MockFile } from '../../types/file';
import { ShareLink } from '../../types/shareLink';
import { useApp } from '../../context/AppContext';
import { formatBytes, getRemainingTime } from '../../utils/formatters';

interface ShareLinkModalProps {
  isOpen: boolean;
  file?: MockFile;
  onClose: () => void;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  file,
  onClose,
}) => {
  const { files, createShareLink, revokeShareLink } = useApp();

  const [selectedFileId, setSelectedFileId] = useState<string>(file?.id || '');
  const [duration, setDuration] = useState<5 | 10 | 15>(15);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [accessNote, setAccessNote] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1: Config & Confirm, 2: Generated Link Result
  const [generatedLink, setGeneratedLink] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize when file prop changes
  useEffect(() => {
    if (file) {
      setSelectedFileId(file.id);
    } else {
      const firstShared = files.find(f => f.category === 'shared');
      if (firstShared) setSelectedFileId(firstShared.id);
    }
    setStep(1);
    setGeneratedLink(null);
    setErrorMessage('');
    setCopied(false);
  }, [file, isOpen, files]);

  if (!isOpen) return null;

  const currentFile = files.find(f => f.id === selectedFileId);
  const sharedEligibleFiles = files.filter(f => f.category === 'shared');

  const handleGenerate = () => {
    if (!currentFile) {
      setErrorMessage('Please select an eligible file.');
      return;
    }
    if (currentFile.category === 'private') {
      setErrorMessage('Security Policy Violation: Private files cannot be shared. Move to Shared first.');
      return;
    }

    try {
      const link = createShareLink(currentFile.id, {
        durationMinutes: duration,
        recipientName: recipientName.trim() || undefined,
        recipientEmail: recipientEmail.trim() || undefined,
        accessNote: accessNote.trim() || undefined,
      });
      setGeneratedLink(link);
      setStep(2);
      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error generating link');
    }
  };

  const fullUrl = generatedLink
    ? `${window.location.origin}/recipient/demo-share/${generatedLink.token}`
    : '';

  const handleCopy = async () => {
    if (!fullUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const input = document.createElement('input');
        input.value = fullUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-500/20">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Generate Secure Sharing Link
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simulated AWS S3 Presigned URL &bull; Max 15m Expiry Limit
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 1 ? (
            <div className="mt-5 space-y-4">
              {/* Step 1: Select File */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Step 1: Select Eligible File (Shared Prefix Only)
                </label>
                <select
                  value={selectedFileId}
                  onChange={e => setSelectedFileId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {sharedEligibleFiles.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({formatBytes(f.size)}) &bull; SHARED
                    </option>
                  ))}
                </select>
                {currentFile && (
                  <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Eligible: File resides in s3://secureshare-vault/shared/ with KMS SSE
                  </p>
                )}
              </div>

              {/* Step 2: Configure Expiry & Recipient */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Step 2: Temporary Expiry Duration
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-3">
                  {([5, 10, 15] as const).map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                        duration === mins
                          ? 'border-brand-500 bg-brand-50/80 text-brand-700 dark:border-brand-400 dark:bg-brand-950/40 dark:text-brand-300 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                      }`}
                    >
                      <Clock className="h-4 w-4 mb-1" />
                      <span className="text-xs font-bold">{mins} Minutes</span>
                      <span className="text-[10px] text-slate-400">
                        {mins === 15 ? 'Max Allowed' : 'Short Window'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Recipient Name (Optional)
                  </label>
                  <div className="mt-1 relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      placeholder="Dr. Ramesh / Partner Auditor"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Recipient Email (Optional)
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={e => setRecipientEmail(e.target.value)}
                      placeholder="recipient@external.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Access Note / Purpose (Optional)
                </label>
                <input
                  type="text"
                  value={accessNote}
                  onChange={e => setAccessNote(e.target.value)}
                  placeholder="Confidential review copy for project defense"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Step 3: Security Confirmation Panel */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-brand-500" />
                  Security Policy Validation:
                </p>
                <ul className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 list-disc list-inside">
                  <li><strong>Single-File Scope:</strong> Authorizes access to this object key only.</li>
                  <li><strong>Strict 15-Minute Expiry:</strong> Token invalidates automatically after {duration}m.</li>
                  <li><strong>TLS Transport Required:</strong> Download served under HTTPS only.</li>
                  <li><strong>Simulated Presigned URL:</strong> Purely frontend demo token; no AWS keys exposed.</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
                >
                  Generate Share Link ({duration}m)
                </button>
              </div>
            </div>
          ) : (
            /* Step 4 & 5: Generated Link Display */
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-5 w-5" />
                </span>
                <h4 className="mt-2 text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Secure Demo Link Active
                </h4>
                <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                  Ready for external recipient download demonstration.
                </p>
              </div>

              {/* Link Box */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Recipient Access URL
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={fullUrl}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-brand-700 transition-colors shrink-0 shadow-sm"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Metadata Breakdown */}
              {generatedLink && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected File:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {generatedLink.fileName} ({formatBytes(generatedLink.fileSize)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {generatedLink.durationMinutes} Minutes (Strict Demo Cap)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Token ID:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {generatedLink.token}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recipient:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {generatedLink.recipientName || 'External Recipient'}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3">
                <a
                  href={`/recipient/demo-share/${generatedLink?.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Recipient Portal in New Tab
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (generatedLink) revokeShareLink(generatedLink.id);
                      onClose();
                    }}
                    className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                  >
                    Revoke Now
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
