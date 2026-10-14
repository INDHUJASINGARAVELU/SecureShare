import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Share2,
  Lock,
  Clock,
  User,
  Mail,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ShareLink } from '../types/shareLink';
import { formatBytes, getRemainingTime } from '../utils/formatters';

export const SharePage: React.FC = () => {
  const { files, createShareLink, revokeShareLink } = useApp();
  const navigate = useNavigate();

  const sharedFiles = files.filter(f => f.category === 'shared');
  const [selectedFileId, setSelectedFileId] = useState<string>(sharedFiles[0]?.id || '');
  const [duration, setDuration] = useState<5 | 10 | 15>(15);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [accessNote, setAccessNote] = useState('');
  const [generatedLink, setGeneratedLink] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const currentFile = files.find(f => f.id === selectedFileId);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFile) {
      setError('Please select an eligible file.');
      return;
    }
    if (currentFile.category === 'private') {
      setError('Policy Denied: Objects in the Private category cannot be shared. Relocate to Shared first.');
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
      setError('');
    } catch (err: any) {
      setError(err.message || 'Generation error');
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
      console.warn(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Secure Ephemeral File Sharing
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Generate temporary presigned URLs with cryptographic signatures and strict 15-minute maximum lifecycle.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!generatedLink ? (
        <form onSubmit={handleGenerate} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          {/* Step 1: Select Eligible File */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Step 1: Choose File from Shared S3 Prefix
              </label>
              <span className="text-[11px] text-slate-400">
                {sharedFiles.length} files eligible
              </span>
            </div>

            {sharedFiles.length > 0 ? (
              <select
                value={selectedFileId}
                onChange={e => setSelectedFileId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {sharedFiles.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({formatBytes(f.size)}) &bull; SHARED
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-slate-800">
                No files in the Shared category. Move files from Private to Shared in the My Files page first.
              </div>
            )}

            {currentFile && (
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span>KMS Key: <code className="font-mono">{currentFile.kmsKeyArn.slice(0, 32)}...</code></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Presigning Authorized
                </span>
              </div>
            )}
          </div>

          {/* Step 2: Configure Expiry Duration */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Step 2: Temporary Link Validity (Max 15 Minutes)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([5, 10, 15] as const).map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
                    duration === mins
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950/40 dark:text-brand-300 ring-2 ring-brand-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                  }`}
                >
                  <Clock className="h-5 w-5 mb-1.5" />
                  <span className="text-sm font-bold">{mins} Minutes</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {mins === 15 ? 'Enforced Ceiling' : 'Fast Revocation'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Recipient Name (Optional)
              </label>
              <div className="mt-1 relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh / Technical Reviewer"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Recipient Email (Optional)
              </label>
              <div className="mt-1 relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  placeholder="recipient@university.edu"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Access Note
            </label>
            <input
              type="text"
              value={accessNote}
              onChange={e => setAccessNote(e.target.value)}
              placeholder="e.g. College final evaluation defense review document"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Step 3: Security Confirmation Panel */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-brand-500" />
              Presigned Security Confirmation:
            </h4>
            <ul className="space-y-1 text-slate-500 dark:text-slate-400 list-disc list-inside">
              <li><strong>Single-File Bound:</strong> Grants temporary access to this file key only.</li>
              <li><strong>Strict Ceiling:</strong> Token permanently expires after {duration} minutes.</li>
              <li><strong>Zero Credential Exposure:</strong> No AWS Access Keys or secrets embedded.</li>
              <li><strong>Instant Revocation:</strong> Can be invalidated at any moment from Access Links.</li>
            </ul>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard/my-files')}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!sharedFiles.length}
              className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              Generate Demo Share Link
            </button>
          </div>
        </form>
      ) : (
        /* Result State */
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-2">
              <Check className="h-6 w-6" />
            </span>
            <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
              Demo Presigned Link Active
            </h3>
            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
              Temporary access window is counting down. Recipient can download without an account.
            </p>
          </div>

          {/* Copy URL Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Shareable Demo URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={fullUrl}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 select-all"
              />
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700 transition-colors shrink-0 shadow-sm"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Details Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">File Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {generatedLink.fileName} ({formatBytes(generatedLink.fileSize)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duration:</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                {generatedLink.durationMinutes} Minutes (Simulated Expiry)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Demo Token:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {generatedLink.token}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <a
              href={`/recipient/demo-share/${generatedLink.token}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Simulate Recipient Download (Open New Tab)</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  revokeShareLink(generatedLink.id);
                  setGeneratedLink(null);
                }}
                className="rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
              >
                Revoke Link
              </button>
              <button
                onClick={() => {
                  setGeneratedLink(null);
                  navigate('/dashboard/access-links');
                }}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                View in Access Links
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
