import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  RotateCw,
  Eye,
  ShieldAlert,
  Server,
  Layers,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditEvent, AuditSeverity, AuditActionType } from '../types/audit';
import { formatDate } from '../utils/formatters';
import { exportToCsv } from '../utils/exportCsv';
import { Badge } from '../components/common/Badge';
import { AuditEventDrawer } from '../components/modals/AuditEventDrawer';
import { EmptyState } from '../components/common/EmptyState';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchActor = log.actor.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchRes = log.resource.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        return matchActor || matchAction || matchRes || matchDetails;
      }
      return true;
    });
  }, [auditLogs, severityFilter, actionFilter, searchQuery]);

  // Unique actions for dropdown
  const uniqueActions = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach(l => set.add(l.action));
    return Array.from(set);
  }, [auditLogs]);

  const handleExportCsv = () => {
    const exportRows = filteredLogs.map(l => ({
      Timestamp: l.timestamp,
      Actor: l.actor,
      Role: l.actorRole,
      Action: l.action,
      Resource: l.resource,
      Result: l.result,
      Severity: l.severity,
      Details: l.details,
      ClientIP: l.clientIp,
      Engine: l.awsServiceSimulated,
    }));
    exportToCsv(`secureshare_audit_logs_${Date.now()}`, exportRows);
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'SUCCESS':
        return 'emerald';
      case 'BLOCKED':
      case 'DENIED':
        return 'rose';
      case 'WARNING':
        return 'amber';
      default:
        return 'blue';
    }
  };

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'rose';
      case 'medium':
        return 'amber';
      case 'low':
        return 'emerald';
      default:
        return 'blue';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Audit Trail & Telemetry Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable activity event records simulated under AWS CloudTrail and S3 Data Events specifications.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" />
          <span>Export Filtered to CSV ({filteredLogs.length})</span>
        </button>
      </div>

      {/* CloudTrail Notice */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <strong className="text-slate-800 dark:text-slate-200">Demonstration Scope:</strong> These records represent localized client-side simulation events designed for project review. They are not actual AWS CloudTrail API calls.
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by actor, action, resource, or IP..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High / Blocked</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Action Type Filter */}
        <div>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="all">All Event Types ({uniqueActions.length})</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      {filteredLogs.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  <th className="py-3 pl-4 pr-3">Timestamp</th>
                  <th className="py-3 px-3">Actor & Role</th>
                  <th className="py-3 px-3">Action Event</th>
                  <th className="py-3 px-3">Target Resource</th>
                  <th className="py-3 px-3">Result</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Details</th>
                  <th className="py-3 pr-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map(log => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedEvent(log)}
                    className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="py-3 pl-4 pr-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        {log.actor}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {log.actorRole}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 font-mono font-medium text-brand-600 dark:text-brand-400">
                      {log.action}
                    </td>

                    {/* Resource */}
                    <td className="py-3 px-3 max-w-xs truncate font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {log.resource}
                    </td>

                    {/* Result */}
                    <td className="py-3 px-3">
                      <Badge variant={getResultBadge(log.result)} size="sm">
                        {log.result}
                      </Badge>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-3">
                      <Badge variant={getSeverityBadge(log.severity)} size="sm">
                        {log.severity.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Details */}
                    <td className="py-3 px-3 max-w-xs truncate text-slate-500 dark:text-slate-400 text-[11px]">
                      {log.details}
                    </td>

                    {/* Inspect */}
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedEvent(log);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View CloudTrail Record"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Audit Records Found"
          description="Try adjusting your severity or action filters to view historical logs."
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearchQuery('');
              setSeverityFilter('all');
              setActionFilter('all');
            },
          }}
        />
      )}

      {/* Audit Event Drawer */}
      <AuditEventDrawer
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
