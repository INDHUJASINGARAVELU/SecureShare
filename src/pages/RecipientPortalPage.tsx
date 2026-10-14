import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield,
  Download,
  Clock,
  Lock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  AlertOctagon,
  FileQuestion,
  ExternalLink,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ShareLink } from '../types/shareLink';
import { MockFile } from '../types/file';
import { formatBytes, formatDate, getRemainingTime } from '../utils/formatters';

export const RecipientPortalPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { recordRecipientAccess, recordDownloadAttempt, files } = useApp();

  const [linkStatus, setLinkStatus] = useState<'loading' | 'active' | 'expired' | 'revoked' | 'invalid'>('loading');
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initial validation & access recording
  useEffect(() => {
    if (!token) {
      setLinkStatus('invalid');
      return;
    }

    const { status, link } = recordRecipientAccess(token);
    setLinkStatus(status);
    if (link) setShareLink(link);
  }, [token, recordRecipientAccess]);

  // Live timer tick for active link
  const [timeRemaining, setTimeRemaining] = useState<string>('15:00');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (linkStatus !== 'active' || !shareLink) return;

    const updateTimer = () => {
      const { formatted, isExpired, isUrgent: urgent } = getRemainingTime(shareLink.expiresAt);
      if (isExpired) {
        setLinkStatus('expired');
      } else {
        setTimeRemaining(formatted);
        setIsUrgent(urgent);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [linkStatus, shareLink]);

  const associatedFile = files.find(f => f.id === shareLink?.fileId);

  const handleDownload = async () => {
    if (!token || !shareLink) return;
    setDownloading(true);
    setErrorMessage('');

    // Simulate verification delay (400ms)
    await new Promise(res => setTimeout(res, 400));

    const result = recordDownloadAttempt(token);
    if (!result.success) {
      setErrorMessage(result.reason || 'Download rejected by security policy.');
      setDownloading(false);
      return;
    }

    // Trigger local download of demonstration payload
    const content =
      associatedFile?.textContent ||
      `SECURESHARE DEMONSTRATION DOWNLOAD\n` +
      `File Name: ${shareLink.fileName}\n` +
      `Size: ${shareLink.fileSize} bytes\n` +
      `Category: Shared Storage Prefix\n` +
      `Presigned Token: ${shareLink.token}\n` +
      `KMS Encryption: AWS KMS SSE (Simulated)\n` +
      `Timestamp: ${new Date().toISOString()}\n\n` +
      `Notice: This file was served locally via client-side state demonstration for college project defense.\n` +
      `Student: Indhuja S. | Department: AI & Data Science | Institution: Sri Manakula Vinayagar Engineering College.`;

    const blob = new Blob([content], { type: shareLink.fileType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = shareLink.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloading(false);
    setDownloadSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Recipient Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-glow-blue">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base">
                Secure<span className="text-brand-400">Share</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                Recipient Download Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span>End-to-End TLS Encrypted Transfer</span>
          </div>
        </div>
      </header>

      {/* Main Recipient Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {linkStatus === 'loading' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center space-y-4">
              <div className="h-10 w-10 mx-auto rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400">
                Validating presigned URL token signature...
              </p>
            </div>
          )}

          {/* STATE 1: ACTIVE VALID LINK */}
          {linkStatus === 'active' && shareLink && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
              {/* Live Countdown Banner */}
              <div className={`flex items-center justify-between rounded-2xl border p-3 text-xs mb-6 ${
                isUrgent
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${isUrgent ? 'animate-pulse' : ''}`} />
                  <span className="font-semibold">Temporary Link Expiry:</span>
                </div>
                <div className="font-mono font-bold text-sm">
                  {timeRemaining}
                </div>
              </div>

              {/* File Information Card */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-brand-400 border border-blue-500/20 shadow-inner">
                  <FileText className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-400">
                    Shared File
                  </span>
                  <h2 className="text-lg font-bold text-white break-all">
                    {shareLink.fileName}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatBytes(shareLink.fileSize)} &bull; Uploaded by {shareLink.createdByUserName}
                  </p>
                </div>
              </div>

              {shareLink.accessNote && (
                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Sharer's Note:
                  </p>
                  <p className="mt-1 italic">"{shareLink.accessNote}"</p>
                </div>
              )}

              {/* Security Specs Checklist */}
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Storage Vault:</span>
                  <span className="font-mono text-slate-200">s3://secureshare-vault/shared/</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Data Protection:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> AWS KMS CMK
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Presigned TTL:</span>
                  <span className="text-slate-200">{shareLink.durationMinutes} Minutes Max</span>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Download Action Button */}
              <div className="mt-6">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? 'Decrypting via KMS...' : 'Securely Download File'}</span>
                </button>
              </div>

              {downloadSuccess && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Demonstration file decrypted and downloaded successfully.</span>
                </div>
              )}

              <p className="mt-4 text-center text-[10px] text-slate-500">
                Notice: Recipient access does not require an AWS account or control plane credentials.
              </p>
            </div>
          )}

          {/* STATE 2: EXPIRED LINK */}
          {linkStatus === 'expired' && (
            <div className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-8 shadow-2xl text-center">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4">
                <Clock className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-bold text-white">
                This Sharing Link Has Expired
              </h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Under the simulated AWS S3 Presigned URL security policy, ephemeral download access is strictly capped at a maximum of 15 minutes. The expiration deadline has passed.
              </p>
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-400">
                HTTP Status: 403 Forbidden (RequestExpired)
              </div>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  &larr; Return to SecureShare Home
                </Link>
              </div>
            </div>
          )}

          {/* STATE 3: REVOKED LINK */}
          {linkStatus === 'revoked' && (
            <div className="rounded-3xl border border-rose-500/30 bg-slate-900/90 p-8 shadow-2xl text-center">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-4">
                <AlertOctagon className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-bold text-white">
                Access to This File Has Been Revoked
              </h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                The Data Owner has revoked this presigned share token through the control plane. All subsequent download attempts are permanently blocked.
              </p>
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-rose-400">
                HTTP Status: 403 Forbidden (TokenRevokedByOwner)
              </div>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  &larr; Return to SecureShare Home
                </Link>
              </div>
            </div>
          )}

          {/* STATE 4: INVALID LINK */}
          {linkStatus === 'invalid' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl text-center">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mb-4">
                <FileQuestion className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-bold text-white">
                This Sharing Link is Invalid
              </h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                The presigned URL token was not recognized by the simulated token validation service. Check that the link was copied completely.
              </p>
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-400">
                HTTP Status: 404 Not Found (InvalidSignatureOrToken)
              </div>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  &larr; Return to SecureShare Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Recipient Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <p>
          SecureShare Demonstration Platform &bull; AWS S3 & KMS Presigned Link Architecture Demo
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Student: Indhuja S. | Dept of AI & DS | Sri Manakula Vinayagar Engineering College
        </p>
      </footer>
    </div>
  );
};
