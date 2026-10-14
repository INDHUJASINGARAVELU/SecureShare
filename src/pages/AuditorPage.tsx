import React, { useState } from 'react';
import {
  Eye,
  ShieldCheck,
  FileText,
  Download,
  AlertTriangle,
  Lock,
  Server,
  Layers,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToCsv } from '../utils/exportCsv';
import { formatDate } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { AuditEventDrawer } from '../components/modals/AuditEventDrawer';
import { AuditEvent } from '../types/audit';

export const AuditorPage: React.FC = () => {
  const { auditLogs, checklistItems, testCases, files } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const deniedEvents = auditLogs.filter(
    l => l.result === 'BLOCKED' || l.result === 'DENIED'
  );

  const filteredLogs = auditLogs.filter(l => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.actor.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.resource.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    const rows = auditLogs.map(l => ({
      Timestamp: l.timestamp,
      Actor: l.actor,
      Role: l.actorRole,
      Action: l.action,
      Resource: l.resource,
      Result: l.result,
      Severity: l.severity,
      Details: l.details,
      ClientIP: l.clientIp,
      SimulatedEngine: l.awsServiceSimulated,
    }));
    exportToCsv(`auditor_compliance_export_${Date.now()}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Compliance & Security Auditor Portal
            </h1>
            <Badge variant="amber" size="sm">
              Read-Only Scope
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Independent assessment portal. Read-only verification of KMS key policies, bucket access restrictions, and CloudTrail event telemetry.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Full Audit Evidence (CSV)</span>
        </button>
      </div>

      {/* Auditor Restriction Notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-2.5">
        <Lock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <strong className="font-semibold">IAM Auditor Boundary Enforced:</strong> Write, upload, delete, and share-link operations are structurally disabled for this role to maintain complete separation of duties.
        </div>
      </div>

      {/* Auditor Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Audited Files
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {files.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {files.filter(f => f.category === 'private').length} Private &bull; {files.filter(f => f.category === 'shared').length} Shared
          </p>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-50/50 p-5 shadow-sm dark:border-rose-950 dark:bg-rose-950/20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Denied / Blocked Incidents
          </p>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
            {deniedEvents.length}
          </p>
          <p className="text-[11px] text-rose-600/80 mt-1">
            Direct bucket access & tampered tokens
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-5 shadow-sm dark:border-emerald-950 dark:bg-emerald-950/20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Checklist Verification
          </p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {checklistItems.filter(c => c.reviewed).length} / {checklistItems.length}
          </p>
          <p className="text-[11px] text-emerald-600/80 mt-1">
            Active architectural controls
          </p>
        </div>
      </div>

      {/* Access Denied Events Spotlight */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Security Policy Denied Incidents
            </h3>
            <p className="text-[11px] text-slate-400">
              High-priority events flagged by simulated CloudTrail and S3 bucket security filters
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {deniedEvents.slice(0, 4).map(evt => (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 cursor-pointer transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {evt.action}
                  </span>
                  <Badge variant="rose" size="sm">
                    {evt.result}
                  </Badge>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                  {evt.details}
                </p>
              </div>

              <div className="text-right text-[11px] text-slate-400 shrink-0">
                <p className="font-mono">{formatDate(evt.timestamp)}</p>
                <p>IP: {evt.clientIp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry Log Search and Inspector */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Full Immutable Audit Logs
            </h3>
            <p className="text-[11px] text-slate-400">
              Evidence stream for ISO 27001 and SOC 2 cloud compliance simulation
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search audit records..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="py-2.5 pl-3 pr-2">Time</th>
                <th className="py-2.5 px-2">Actor</th>
                <th className="py-2.5 px-2">Action</th>
                <th className="py-2.5 px-2">Resource</th>
                <th className="py-2.5 px-2">Result</th>
                <th className="py-2.5 pr-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.slice(0, 10).map(l => (
                <tr
                  key={l.id}
                  onClick={() => setSelectedEvent(l)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                >
                  <td className="py-2.5 pl-3 pr-2 font-mono text-[11px] text-slate-500">
                    {formatDate(l.timestamp)}
                  </td>
                  <td className="py-2.5 px-2 font-semibold text-slate-900 dark:text-white">
                    {l.actor}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-brand-600 dark:text-brand-400">
                    {l.action}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-[11px] max-w-xs truncate text-slate-600 dark:text-slate-300">
                    {l.resource}
                  </td>
                  <td className="py-2.5 px-2">
                    <Badge
                      variant={l.result === 'SUCCESS' ? 'emerald' : 'rose'}
                      size="sm"
                    >
                      {l.result}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedEvent(l);
                      }}
                      className="rounded-lg p-1 text-slate-400 hover:text-brand-600"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Drawer */}
      <AuditEventDrawer
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
