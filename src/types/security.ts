export type SecurityLayerType = 'identity' | 'storage' | 'encryption' | 'sharing' | 'monitoring';

export type SecurityStatusBadge = 'Configured in Demo' | 'Simulated' | 'Needs Review' | 'Warning';

export interface SecurityLayerItem {
  id: string;
  layer: SecurityLayerType;
  title: string;
  description: string;
  awsConcept: string;
  status: SecurityStatusBadge;
  details: string[];
}

export interface SecurityChecklistItem {
  id: string;
  layer: SecurityLayerType;
  label: string;
  description: string;
  reviewed: boolean;
  reviewedAt?: string;
  awsPolicySnippet?: string;
}

export type TestResultStatus = 'PASS' | 'FAIL' | 'NOT_RUN';

export interface SecurityTestCase {
  id: string;
  testNumber: number;
  title: string;
  description: string;
  category: string;
  expectedOutcome: string;
  actualOutcome?: string;
  status: TestResultStatus;
  lastRunAt?: string;
  latencyMs?: number;
  simulatedRequest: {
    method: string;
    endpoint: string;
    headers: Record<string, string>;
    bodySnippet?: string;
  };
  policyEvaluated: string;
}
