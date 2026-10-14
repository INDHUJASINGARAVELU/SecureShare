import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Server,
  Key,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Code2,
  ChevronDown,
  ChevronUp,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INITIAL_SECURITY_LAYERS } from '../data/initialSecurityData';
import { Badge } from '../components/common/Badge';

export const SecurityCenterPage: React.FC = () => {
  const { checklistItems, toggleChecklistItem } = useApp();
  const [expandedSnippet, setExpandedSnippet] = useState<string | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const reviewedCount = checklistItems.filter(c => c.reviewed).length;
  const progressPercent = Math.round((reviewedCount / checklistItems.length) * 100);

  const layerIcons = {
    identity: Lock,
    storage: Server,
    encryption: Key,
    sharing: Clock,
    monitoring: Eye,
  };

  const handleCopySnippet = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cloud Security Architecture Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Defense-in-depth architecture model based on AWS S3, KMS envelope encryption, IAM boundaries and CloudTrail observability.
          </p>
        </div>

        {/* Overall Audit Score Pill */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Checklist Review Progress
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {reviewedCount} of {checklistItems.length} Reviewed ({progressPercent}%)
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 5 Security Architecture Layers Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Layered Defense Specifications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_SECURITY_LAYERS.map(layer => {
            const Icon = layerIcons[layer.layer];

            return (
              <div
                key={layer.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge
                      variant={layer.status === 'Configured in Demo' ? 'emerald' : 'blue'}
                      size="sm"
                    >
                      {layer.status}
                    </Badge>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                    {layer.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                    {layer.awsConcept}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {layer.description}
                  </p>

                  <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {layer.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Demonstration Security Checklist */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Demonstration Verification Checklist
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive audit checkpoints mapped to AWS IAM, S3 and KMS bucket policies.
            </p>
          </div>
          <Badge variant="indigo" size="sm">
            College Defense Baseline
          </Badge>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {checklistItems.map(item => {
            const isExpanded = expandedSnippet === item.id;

            return (
              <div key={item.id} className="py-3.5 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.reviewed}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950"
                    />
                    <div>
                      <span
                        className={`text-xs font-bold ${
                          item.reviewed
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.label}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={item.reviewed ? 'emerald' : 'slate'} size="sm">
                      {item.reviewed ? 'Reviewed' : 'Pending'}
                    </Badge>

                    {item.awsPolicySnippet && (
                      <button
                        onClick={() =>
                          setExpandedSnippet(isExpanded ? null : item.id)
                        }
                        className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                        title="Inspect AWS Policy"
                      >
                        <Code2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Policy Snippet Inspector */}
                {isExpanded && item.awsPolicySnippet && (
                  <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3 text-[11px] font-mono text-emerald-400">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[10px]">
                      <span>AWS CLI / Policy JSON Definition</span>
                      <button
                        onClick={() => handleCopySnippet(item.id, item.awsPolicySnippet!)}
                        className="flex items-center gap-1 hover:text-white"
                      >
                        {copiedSnippetId === item.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedSnippetId === item.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap overflow-x-auto">
                      {item.awsPolicySnippet}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
