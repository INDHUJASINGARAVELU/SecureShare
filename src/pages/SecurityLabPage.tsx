import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Code2,
  Server,
  AlertTriangle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SecurityTestCase } from '../types/security';
import { formatDate } from '../utils/formatters';
import { Badge } from '../components/common/Badge';

export const SecurityLabPage: React.FC = () => {
  const { testCases, runSecurityTest, runAllSecurityTests, resetSecurityTests } = useApp();
  const [runningAll, setRunningAll] = useState(false);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);

  const passedCount = testCases.filter(t => t.status === 'PASS').length;
  const failedCount = testCases.filter(t => t.status === 'FAIL').length;
  const notRunCount = testCases.filter(t => t.status === 'NOT_RUN').length;

  const handleRunSingle = async (testId: string) => {
    setRunningTestId(testId);
    await runSecurityTest(testId);
    setRunningTestId(null);
  };

  const handleRunAll = async () => {
    setRunningAll(true);
    await runAllSecurityTests();
    setRunningAll(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Security Verification Lab
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive simulated test suite validating boundary policies, presigned token life cycles, and least-privilege enforcement.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetSecurityTests}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Tests</span>
          </button>
          <button
            onClick={handleRunAll}
            disabled={runningAll}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{runningAll ? 'Executing Suite...' : 'Run All 9 Tests'}</span>
          </button>
        </div>
      </div>

      {/* Summary Scoreboard */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/60 p-4 dark:border-emerald-950 dark:bg-emerald-950/30">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Tests Passed
          </p>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
            {passedCount} / {testCases.length}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-50/60 p-4 dark:border-rose-950 dark:bg-rose-950/30">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Tests Failed
          </p>
          <p className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-1">
            {failedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Awaiting Execution
          </p>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">
            {notRunCount}
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
        <strong className="font-semibold">Lab Methodology Notice:</strong> These verification scenarios evaluate simulated frontend requests against simulated AWS IAM and S3 bucket policies. They demonstrate the project defense logic without actual cloud infrastructure.
      </div>

      {/* 9 Test Cases Cards */}
      <div className="space-y-4">
        {testCases.map(test => {
          const isRunning = runningTestId === test.id || runningAll;

          return (
            <div
              key={test.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    #{test.testNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {test.title}
                      </h3>
                      <Badge variant="indigo" size="sm">
                        {test.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {test.description}
                    </p>
                  </div>
                </div>

                {/* Status Badge & Run Button */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {test.status === 'PASS' && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>PASS</span>
                    </span>
                  )}
                  {test.status === 'FAIL' && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-500/20">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>FAIL</span>
                    </span>
                  )}
                  {test.status === 'NOT_RUN' && (
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      NOT RUN
                    </span>
                  )}

                  <button
                    onClick={() => handleRunSingle(test.id)}
                    disabled={isRunning}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-500/30 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300 transition-colors disabled:opacity-50"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>{isRunning ? 'Running...' : 'Run Test'}</span>
                  </button>
                </div>
              </div>

              {/* Request & Policy Inspector */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Simulated Request:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    <strong className="text-brand-600 dark:text-brand-400">{test.simulatedRequest.method}</strong> {test.simulatedRequest.endpoint}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Policy Evaluated:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {test.policyEvaluated}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Expected Outcome:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {test.expectedOutcome}
                  </span>
                </div>
                {test.actualOutcome && (
                  <div className="flex items-center justify-between text-[11px] border-t border-slate-200 dark:border-slate-800 pt-1.5">
                    <span className="text-slate-500">Actual Result:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {test.actualOutcome}
                    </span>
                  </div>
                )}
                {test.lastRunAt && (
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Last Execution: {formatDate(test.lastRunAt)}</span>
                    <span>Latency: ~{test.latencyMs}ms</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
