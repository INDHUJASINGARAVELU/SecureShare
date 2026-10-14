import React from 'react';
import {
  HelpCircle,
  GraduationCap,
  Shield,
  UploadCloud,
  FolderLock,
  Clock,
  Key,
  ShieldAlert,
  Server,
  Code2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const HelpPage: React.FC = () => {
  const faqSections = [
    {
      icon: UploadCloud,
      title: 'How to Upload & Ingest Files',
      content:
        'Navigate to Upload Files. Select your target storage prefix (Shared or Private), then drag-and-drop or browse files from your computer. The system validates file size (50MB demo limit) and generates simulated AWS KMS encryption metadata (Key ARN, Version ID, SHA-256 checksum).',
    },
    {
      icon: FolderLock,
      title: 'Difference Between Private and Shared Files',
      content:
        'Objects in the Private/ storage prefix represent strictly isolated confidential documents (such as master credentials, internal reports, or employee PII). They cannot be presigned or shared with external recipients. Objects in the Shared/ prefix can have time-bounded presigned links generated for recipient download.',
    },
    {
      icon: Clock,
      title: 'How Temporary Demo Links & 15-Minute Expiry Work',
      content:
        'When you generate a share link from an eligible file, you select a validity duration of 5, 10, or 15 minutes (strictly capped at 15m as per the architecture spec). The live system countdown evaluates expiration continuously. Once expired, any recipient download attempt is denied with HTTP 403 (RequestExpired).',
    },
    {
      icon: ShieldAlert,
      title: 'Emergency Link Revocation',
      content:
        'Data Owners and Administrators can click "Revoke" on any active share link from the Access Links page. Revocation records update the control plane immediately, cutting off recipient access even before the 15-minute window expires.',
    },
    {
      icon: Server,
      title: 'What the Security Center & Verification Lab Represent',
      content:
        'The Security Center models defense-in-depth across 5 layers: Identity (IAM), Storage (S3), Encryption (KMS), Sharing (Presigned URLs), and Monitoring (CloudTrail). The Security Lab contains 9 automated test scenarios that evaluate policy rules like direct-access blocking, TLS enforcement, and unauthorized auditor write prevention.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Help, Architectural Guide & Project Information
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          User guide for presentation evaluators and full college capstone project attribution.
        </p>
      </div>

      {/* College Project Details Card (Required in Section 19) */}
      <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-br from-blue-900/40 via-indigo-950/50 to-slate-950 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-300 border border-brand-400/30">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">
              Academic Project Attribution
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              SecureShare – A Secure File Sharing System on AWS Using Private S3 Storage, KMS Encryption, IAM Policies and Presigned URLs
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-brand-500/20">
              <div>
                <span className="text-slate-400 block text-[11px]">Candidate Student:</span>
                <span className="font-bold text-white">Indhuja S.</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Academic Department:</span>
                <span className="font-semibold text-slate-200">Artificial Intelligence and Data Science</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Institution:</span>
                <span className="font-semibold text-slate-200">Sri Manakula Vinayagar Engineering College</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real AWS vs Frontend Simulation Comparison Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Architecture Matrix: Real AWS Implementation vs. Frontend Simulation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Understanding how production AWS services are mirrored in this client-side demonstration sandbox.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
              <tr>
                <th className="py-2.5 pl-3 pr-2">Security Domain</th>
                <th className="py-2.5 px-3">Production AWS Service</th>
                <th className="py-2.5 px-3">SecureShare Frontend Simulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <td className="py-3 pl-3 pr-2 font-bold text-slate-900 dark:text-white">
                  Storage Vault
                </td>
                <td className="py-3 px-3 font-mono text-[11px]">
                  Amazon S3 (Private Bucket + BPA enabled)
                </td>
                <td className="py-3 px-3">
                  Categorized state (Private vs Shared prefixes) with browser File API and localStorage persistence.
                </td>
              </tr>
              <tr>
                <td className="py-3 pl-3 pr-2 font-bold text-slate-900 dark:text-white">
                  Cryptography
                </td>
                <td className="py-3 px-3 font-mono text-[11px]">
                  AWS KMS Customer Managed Key (SSE-KMS)
                </td>
                <td className="py-3 px-3">
                  Simulated CMK ARNs, envelope encryption status tags, and SHA-256 integrity checksums.
                </td>
              </tr>
              <tr>
                <td className="py-3 pl-3 pr-2 font-bold text-slate-900 dark:text-white">
                  Temporary Sharing
                </td>
                <td className="py-3 px-3 font-mono text-[11px]">
                  S3 Presigned URLs (SigV4 query parameters)
                </td>
                <td className="py-3 px-3">
                  Internal routes (<code className="font-mono text-[11px] text-brand-500">/recipient/demo-share/:token</code>) with 15m live timers.
                </td>
              </tr>
              <tr>
                <td className="py-3 pl-3 pr-2 font-bold text-slate-900 dark:text-white">
                  Access Control
                </td>
                <td className="py-3 px-3 font-mono text-[11px]">
                  AWS IAM Roles, Least-Privilege & Virtual MFA
                </td>
                <td className="py-3 px-3">
                  Frontend RoleGuard, simulated TOTP modal, and persona switcher (Owner, Admin, Auditor, Recipient).
                </td>
              </tr>
              <tr>
                <td className="py-3 pl-3 pr-2 font-bold text-slate-900 dark:text-white">
                  Audit Telemetry
                </td>
                <td className="py-3 px-3 font-mono text-[11px]">
                  AWS CloudTrail & Amazon CloudWatch
                </td>
                <td className="py-3 px-3">
                  Real-time audit log stream, downloadable CSV exports, and CloudTrail JSON inspector drawer.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Demonstration Guide & Operating Instructions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqSections.map((faq, idx) => {
            const Icon = faq.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {faq.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {faq.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
