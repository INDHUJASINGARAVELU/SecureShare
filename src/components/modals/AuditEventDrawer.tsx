import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Code2, Server, Globe, User, Clock, FileCheck } from 'lucide-react';
import { AuditEvent } from '../../types/audit';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';

interface AuditEventDrawerProps {
  event: AuditEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditEventDrawer: React.FC<AuditEventDrawerProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !event) return null;

  const severityBadge = {
    info: 'blue',
    low: 'emerald',
    medium: 'amber',
    high: 'rose',
    critical: 'rose',
  }[event.severity] as any;

  const resultBadge = {
    SUCCESS: 'emerald',
    DENIED: 'rose',
    BLOCKED: 'rose',
    WARNING: 'amber',
  }[event.result] as any;

  const simulatedCloudTrailJson = {
    eventVersion: '1.08',
    userIdentity: {
      type: 'IAMUser',
      principalId: 'AIDAI12345EXAMPLE',
      arn: `arn:aws:iam::982341982734:user/${event.actor.toLowerCase().replace(/\s+/g, '.')}`,
      accountId: '982341982734',
      userName: event.actor,
    },
    eventTime: event.timestamp,
    eventSource: `${event.awsServiceSimulated.toLowerCase()}.amazonaws.com`,
    eventName: event.action,
    awsRegion: 'ap-south-1',
    sourceIPAddress: event.clientIp,
    userAgent: event.userAgent,
    requestParameters: {
      resourceName: event.resource,
      simulationState: 'FRONTEND_MOCK',
    },
    responseElements: {
      resultStatus: event.result,
      policyOutcome: event.details,
    },
    eventType: 'AwsApiCall',
    managementEvent: event.awsServiceSimulated === 'CloudTrail',
    recipientAccountId: '982341982734',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Drawer */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-lg bg-white p-6 shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-500/20">
                    <ShieldAlert className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      CloudTrail Telemetry Event
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Event ID: {event.id}
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

              {/* Status and Action */}
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {event.action}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={resultBadge}>{event.result}</Badge>
                    <Badge variant={severityBadge} size="sm">
                      {event.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Key metadata grid */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> Timestamp:
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" /> IAM Principal:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {event.actor} ({event.actorRole})
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-slate-400" /> Source IP:
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {event.clientIp}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-slate-400" /> AWS Simulated Engine:
                    </span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {event.awsServiceSimulated}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Target Resource:</span>
                    <p className="mt-1 font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                      {event.resource}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500">Evaluation Details:</span>
                    <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                      {event.details}
                    </p>
                  </div>
                </div>

                {/* CloudTrail Simulated JSON Inspector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5" /> Simulated CloudTrail Record JSON
                    </span>
                  </div>
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 text-[11px] font-mono text-emerald-400 scrollbar-thin">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(simulatedCloudTrailJson, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl">
              <strong>Notice:</strong> These are frontend demonstration events generated locally to simulate AWS CloudTrail audit logs for project evaluation.
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
