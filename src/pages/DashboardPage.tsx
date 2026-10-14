import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderLock,
  Lock,
  Share2,
  Link2,
  Clock,
  ShieldCheck,
  UploadCloud,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  HardDrive,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { ShareLinkModal } from '../components/modals/ShareLinkModal';
import { FileDetailsDrawer } from '../components/modals/FileDetailsDrawer';
import { MockFile } from '../types/file';
import { formatBytes, formatDate, getRemainingTime } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { files, shareLinks, auditLogs } = useApp();
  const { currentUser, role } = useAuth();
  const navigate = useNavigate();

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedShareFile, setSelectedShareFile] = useState<MockFile | undefined>(undefined);
  const [detailFile, setDetailFile] = useState<MockFile | null>(null);

  // Derived metrics
  const totalFiles = files.length;
  const privateFiles = files.filter(f => f.category === 'private').length;
  const sharedFiles = files.filter(f => f.category === 'shared').length;
  const activeLinks = shareLinks.filter(l => l.status === 'active').length;

  const expiringSoonCount = shareLinks.filter(l => {
    if (l.status !== 'active') return false;
    const { totalSeconds } = getRemainingTime(l.expiresAt);
    return totalSeconds > 0 && totalSeconds < 180; // < 3 mins
  }).length;

  const securityEventsCount = auditLogs.filter(
    a => a.severity === 'high' || a.severity === 'critical' || a.result === 'BLOCKED'
  ).length;

  // Storage usage calculation
  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);
  const maxStorageBytes = 100 * 1024 * 1024; // 100 MB simulated quota
  const storagePercentage = Math.min(Math.round((totalSizeBytes / maxStorageBytes) * 100), 100);

  // Recharts: File activity line/area chart data
  const activityData = [
    { name: 'Mon', uploads: 2, access: 4, blocked: 0 },
    { name: 'Tue', uploads: 3, access: 7, blocked: 1 },
    { name: 'Wed', uploads: 1, access: 9, blocked: 0 },
    { name: 'Thu', uploads: 4, access: 14, blocked: 2 },
    { name: 'Fri', uploads: 2, access: 18, blocked: 1 },
    { name: 'Sat', uploads: 1, access: 8, blocked: 0 },
    { name: 'Today', uploads: totalFiles, access: activeLinks * 3 + 6, blocked: securityEventsCount },
  ];

  // Recharts: File type distribution
  const fileTypeMap = files.reduce((acc: Record<string, number>, f) => {
    const ext = f.extension.toUpperCase();
    acc[ext] = (acc[ext] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(fileTypeMap).map(([name, value]) => ({
    name,
    value,
  }));

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

  const recentUploads = files.slice(0, 5);
  const recentLinks = shareLinks.slice(0, 4);
  const recentActivity = auditLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Security Control Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time status of private S3 storage, KMS encryption keys, and active presigned sharing links.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {role === 'data_owner' && (
            <button
              onClick={() => navigate('/dashboard/upload')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload File</span>
            </button>
          )}

          {role === 'data_owner' && (
            <button
              onClick={() => {
                setSelectedShareFile(undefined);
                setShareModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Share2 className="h-4 w-4 text-brand-500" />
              <span>Create Share Link</span>
            </button>
          )}

          <button
            onClick={() => navigate('/dashboard/security-lab')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Verify Security</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Files"
          value={totalFiles}
          subtitle="In Private Vault"
          icon={FolderLock}
          variant="blue"
          onClick={() => navigate('/dashboard/my-files')}
        />
        <StatCard
          title="Private Files"
          value={privateFiles}
          subtitle="Non-Shareable"
          icon={Lock}
          variant="amber"
          onClick={() => navigate('/dashboard/my-files')}
        />
        <StatCard
          title="Shared Files"
          value={sharedFiles}
          subtitle="Presign-Eligible"
          icon={Share2}
          variant="indigo"
          onClick={() => navigate('/dashboard/my-files')}
        />
        <StatCard
          title="Active Links"
          value={activeLinks}
          subtitle="Max 15m Expiry"
          icon={Link2}
          variant="emerald"
          onClick={() => navigate('/dashboard/access-links')}
        />
        <StatCard
          title="Expiring Soon"
          value={expiringSoonCount}
          subtitle="< 3 mins left"
          icon={Clock}
          variant={expiringSoonCount > 0 ? 'rose' : 'emerald'}
          onClick={() => navigate('/dashboard/access-links')}
        />
        <StatCard
          title="Security Events"
          value={securityEventsCount}
          subtitle="Blocked / Alerts"
          icon={ShieldCheck}
          variant="rose"
          onClick={() => navigate('/dashboard/audit-logs')}
        />
      </div>

      {/* Storage Progress & AWS Security Status Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Storage Usage Progress Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-brand-500" />
              S3 Storage Quota
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {formatBytes(totalSizeBytes)} / 100 MB
            </span>
          </div>

          <div className="mt-3 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${Math.max(storagePercentage, 6)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>{storagePercentage}% capacity consumed</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              &bull; S3 Versioning Active
            </span>
          </div>
        </div>

        {/* AWS KMS & S3 Configuration Panel */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Simulated AWS Security Baseline
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
              100% Policy Adherence
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
              <span className="text-[10px] text-slate-400 block">S3 Bucket Access</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Blocked Public</span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
              <span className="text-[10px] text-slate-400 block">Encryption Standard</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">AWS KMS SSE</span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
              <span className="text-[10px] text-slate-400 block">Presigned Ceiling</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">15m Max TTL</span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
              <span className="text-[10px] text-slate-400 block">Transport Policy</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">HTTPS Only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: Activity Area Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* File & Access Telemetry Line/Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                File Ingestion & Presigned Access Telemetry
              </h3>
              <p className="text-[11px] text-slate-400">
                Weekly simulated requests (Uploads, Presigned Link Downloads, Blocked Attacks)
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorAccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="access"
                  name="Presigned Downloads"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorAccess)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="uploads"
                  name="Encrypted Uploads"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorUploads)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* File Type Distribution Donut Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Storage Format Distribution
            </h3>
            <p className="text-[11px] text-slate-400">
              Breakdown by encrypted file extension
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No file data</p>
            )}
          </div>

          <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
            All objects protected by Customer Master Key (CMK)
          </div>
        </div>
      </div>

      {/* Recent Tables: Recent Uploads & Active Share Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Files Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent S3 Vault Objects
              </h3>
              <p className="text-[11px] text-slate-400">
                Latest encrypted files in storage
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/my-files')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {recentUploads.map(file => (
              <div
                key={file.id}
                onClick={() => setDetailFile(file)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-600 dark:bg-blue-950/60 dark:text-brand-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatBytes(file.size)} &bull; {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={file.category === 'shared' ? 'blue' : 'amber'}
                    size="sm"
                  >
                    {file.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Created Share Links */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Temporary Share Links
              </h3>
              <p className="text-[11px] text-slate-400">
                Presigned links subject to 15-minute expiry
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/access-links')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
            >
              <span>Manage Links</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {recentLinks.map(link => {
              const { formatted, isExpired, isUrgent } = getRemainingTime(link.expiresAt);
              const isRevoked = link.status === 'revoked';

              return (
                <div
                  key={link.id}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <Link2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {link.fileName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Recipient: {link.recipientName || 'External'} &bull; Token: {link.token.slice(0, 12)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isRevoked ? (
                      <Badge variant="rose" size="sm">REVOKED</Badge>
                    ) : isExpired ? (
                      <Badge variant="slate" size="sm">EXPIRED</Badge>
                    ) : (
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Clock className={`h-3.5 w-3.5 ${isUrgent ? 'text-amber-500 animate-spin' : ''}`} />
                        <span>{formatted}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Share Modal & Details Drawer */}
      <ShareLinkModal
        isOpen={shareModalOpen}
        file={selectedShareFile}
        onClose={() => setShareModalOpen(false)}
      />

      <FileDetailsDrawer
        file={detailFile}
        isOpen={!!detailFile}
        onClose={() => setDetailFile(null)}
        onOpenShareModal={f => {
          setSelectedShareFile(f);
          setShareModalOpen(true);
        }}
      />
    </div>
  );
};
