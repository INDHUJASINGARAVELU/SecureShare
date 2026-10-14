export type AuditActionType =
  | 'USER_LOGIN'
  | 'MFA_VERIFICATION'
  | 'FILE_UPLOAD'
  | 'FILE_RENAME'
  | 'FILE_CATEGORY_CHANGE'
  | 'FILE_DELETION'
  | 'SHARE_LINK_CREATED'
  | 'SHARE_LINK_COPIED'
  | 'SHARE_LINK_REVOKED'
  | 'DOWNLOAD_ATTEMPT'
  | 'ACCESS_DENIED'
  | 'LINK_EXPIRED'
  | 'SECURITY_TEST_RUN'
  | 'ROLE_ACCESS_DENIED'
  | 'SETTINGS_UPDATED';

export type AuditResult = 'SUCCESS' | 'DENIED' | 'BLOCKED' | 'WARNING';
export type AuditSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface AuditEvent {
  id: string;
  timestamp: string; // ISO format
  actor: string;
  actorRole: string;
  action: AuditActionType;
  resource: string;
  result: AuditResult;
  severity: AuditSeverity;
  details: string;
  clientIp: string;
  userAgent: string;
  awsServiceSimulated: 'CloudTrail' | 'S3-DataEvent' | 'KMS-API' | 'IAM-Auth' | 'GuardDuty';
}
