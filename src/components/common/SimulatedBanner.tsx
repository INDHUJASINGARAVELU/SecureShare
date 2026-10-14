import React, { useState } from 'react';
import { ShieldCheck, Info, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SimulatedBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative border-b border-brand-500/20 bg-gradient-to-r from-blue-900/90 via-indigo-950/95 to-slate-950 text-xs text-blue-100 px-4 py-2 flex items-center justify-between shadow-inner">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-brand-300 ring-1 ring-blue-400/40">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
        </span>
        <p className="truncate">
          <strong className="font-semibold text-white">Frontend Demonstration Mode:</strong>{' '}
          <span className="text-blue-200/90">
            AWS S3 Private Storage, KMS SSE-KMS, IAM Policies, and Presigned URLs are simulated locally via client-side state. No actual cloud charges or secrets used.
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <Link
          to="/dashboard/help"
          className="inline-flex items-center gap-1 font-medium text-brand-300 hover:text-white underline-offset-2 hover:underline transition-colors"
        >
          <Info className="h-3 w-3" />
          <span>Project Architecture</span>
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="text-blue-300/70 hover:text-white transition-colors"
          title="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
