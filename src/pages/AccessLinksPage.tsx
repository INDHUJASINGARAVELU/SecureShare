import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Link2,
  Clock,
  Search,
  Filter,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  RotateCcw,
  Plus,
  AlertOctagon,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ShareLink } from '../types/shareLink';
import { formatBytes, formatDate, getRemainingTime } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ShareLinkModal } from '../components/modals/ShareLinkModal';
import { EmptyState } from '../components/common/EmptyState';

export const AccessLinksPage: React.FC = () => {
  const { shareLinks, revokeShareLink } = useApp();
  const { role } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [linkToRevoke, setLinkToRevoke] = useState<ShareLink | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const isAuditor = role === 'security_auditor';

  // Derived link counts
  const totalLinks = shareLinks.length;
  const activeLinks = shareLinks.filter(l => l.status === 'active').length;
  const expiredLinks = shareLinks.filter(l => l.status === 'expired').length;
  const revokedLinks = shareLinks.filter(l => l.status === 'revoked').length;

  const filteredLinks = shareLinks.filter(link => {
    if (statusFilter !== 'all' && link.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = link.fileName.toLowerCase().includes(q);
      const matchToken = link.token.toLowerCase().includes(q);
      const matchRec = (link.recipientName || '').toLowerCase().includes(q);
      return matchName || matchToken || matchRec;
    }
    return true;
  });

  const handleCopy = async (link: ShareLink) => {
    const fullUrl = `${window.location.origin}/recipient/demo-share/${link.token}`;
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
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Presigned Access Link Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active and historical ephemeral access tokens. Enforces simulated 15-minute maximum lifecycle and immediate control-plane revocation.
          </p>
        </div>

        {!isAuditor && (
          <button
            onClick={() => setShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Generate New Share Link</span>
          </button>
        )}
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Links"
          value={totalLinks}
          subtitle="Generated in demo"
          icon={Link2}
          variant="blue"
        />
        <StatCard
          title="Active Links"
          value={activeLinks}
          subtitle="Currently authorized"
          icon={ShieldCheck}
          variant="emerald"
        />
        <StatCard
          title="Expired Links"
          value={expiredLinks}
          subtitle="TTL window closed"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title="Revoked Links"
          value={revokedLinks}
          subtitle="Manually invalidated"
          icon={ShieldAlert}
          variant="rose"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            All ({totalLinks})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === 'active'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Active ({activeLinks})
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === 'expired'
                ? 'bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Expired ({expiredLinks})
          </button>
          <button
            onClick={() => setStatusFilter('revoked')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === 'revoked'
                ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-800 dark:text-rose-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Revoked ({revokedLinks})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by file or token..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {/* Links Table */}
      {filteredLinks.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  <th className="py-3 pl-4 pr-3">Target S3 File</th>
                  <th className="py-3 px-3">Recipient</th>
                  <th className="py-3 px-3">Created At</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Time Remaining</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Downloads</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLinks.map(link => {
                  const { formatted, isExpired, isUrgent } = getRemainingTime(link.expiresAt);
                  const isRevoked = link.status === 'revoked';

                  return (
                    <tr
                      key={link.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Target File */}
                      <td className="py-3 pl-4 pr-3">
                        <div className="flex items-center gap-2.5 max-w-xs">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-600 dark:bg-blue-950/60 dark:text-brand-400">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                              {link.fileName}
                            </p>
                            <p className="font-mono text-[10px] text-slate-400">
                              {link.token}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <span className="font-medium">
                          {link.recipientName || 'External Recipient'}
                        </span>
                        {link.recipientEmail && (
                          <span className="block text-[10px] text-slate-400">
                            {link.recipientEmail}
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {formatDate(link.createdAt)}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {link.durationMinutes}m
                      </td>

                      {/* Time Remaining */}
                      <td className="py-3 px-3">
                        {isRevoked ? (
                          <span className="text-rose-500 font-mono text-[11px] font-semibold">
                            Revoked
                          </span>
                        ) : isExpired ? (
                          <span className="text-slate-400 font-mono text-[11px]">
                            00:00 (Expired)
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            <Clock className={`h-3 w-3 ${isUrgent ? 'text-amber-500 animate-spin' : ''}`} />
                            <span>{formatted}</span>
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        {isRevoked ? (
                          <Badge variant="rose" size="sm">REVOKED</Badge>
                        ) : isExpired ? (
                          <Badge variant="slate" size="sm">EXPIRED</Badge>
                        ) : (
                          <Badge variant="emerald" size="sm" dot>ACTIVE</Badge>
                        )}
                      </td>

                      {/* Downloads */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {link.downloadCount} dl / {link.accessCount} hits
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Link */}
                          <button
                            onClick={() => handleCopy(link)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Copy demo link"
                          >
                            {copiedId === link.id ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>

                          {/* Open Recipient View */}
                          <a
                            href={`/recipient/demo-share/${link.token}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            title="Preview Recipient Portal"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>

                          {/* Revoke button if active */}
                          {link.status === 'active' && !isAuditor && (
                            <button
                              onClick={() => setLinkToRevoke(link)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Revoke Link Immediately"
                            >
                              <AlertOctagon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Link2}
          title="No Presigned Links Found"
          description="Create a secure share link for any file in the Shared S3 prefix."
          action={
            !isAuditor
              ? {
                  label: 'Create Share Link',
                  onClick: () => setShareModalOpen(true),
                }
              : undefined
          }
        />
      )}

      {/* Revocation Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!linkToRevoke}
        title="Revoke Ephemeral Share Link"
        message={`Are you sure you want to revoke the share token for "${linkToRevoke?.fileName}"? Any recipient currently attempting to download will be immediately blocked with HTTP 403.`}
        confirmLabel="Revoke Link Immediately"
        variant="danger"
        onConfirm={() => {
          if (linkToRevoke) revokeShareLink(linkToRevoke.id);
          setLinkToRevoke(null);
        }}
        onCancel={() => setLinkToRevoke(null)}
      />

      {/* Share Modal */}
      <ShareLinkModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
};
