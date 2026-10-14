import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MockFile, FileCategory } from '../types/file';
import { ShareLink } from '../types/shareLink';
import { AuditEvent } from '../types/audit';
import { AppNotification, AppSettings } from '../types/notification';
import { SecurityChecklistItem, SecurityTestCase } from '../types/security';

import { INITIAL_FILES } from '../data/initialFiles';
import { INITIAL_SHARE_LINKS } from '../data/initialShareLinks';
import { INITIAL_AUDIT_LOGS } from '../data/initialAuditLogs';
import { INITIAL_CHECKLIST_ITEMS, INITIAL_TEST_CASES } from '../data/initialSecurityData';
import {
  generateSimulatedKmsKey,
  generateSimulatedVersionId,
  generateSimulatedSha256,
  generateDemoShareToken,
  MOCK_KMS_ARN,
} from '../utils/cryptoSim';

interface AppContextType {
  // Files
  files: MockFile[];
  uploadFile: (data: {
    name: string;
    size: number;
    type: string;
    extension: string;
    category: FileCategory;
    textContent?: string;
    previewUrl?: string;
    tags?: string[];
  }) => Promise<MockFile>;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  moveFileCategory: (fileId: string, newCategory: FileCategory) => void;

  // Share Links
  shareLinks: ShareLink[];
  createShareLink: (
    fileId: string,
    options: {
      durationMinutes: 5 | 10 | 15;
      recipientName?: string;
      recipientEmail?: string;
      accessNote?: string;
    }
  ) => ShareLink;
  revokeShareLink: (linkId: string) => void;
  getShareLinkByToken: (token: string) => ShareLink | undefined;
  recordRecipientAccess: (token: string) => { status: 'active' | 'expired' | 'revoked' | 'invalid'; link?: ShareLink };
  recordDownloadAttempt: (token: string) => { success: boolean; reason?: string };

  // Audit Logs
  auditLogs: AuditEvent[];
  addAuditLog: (entry: Omit<AuditEvent, 'id' | 'timestamp'>) => void;
  clearAuditLogs: () => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  addNotification: (item: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Security Checklist & Verification
  checklistItems: SecurityChecklistItem[];
  toggleChecklistItem: (id: string) => void;
  testCases: SecurityTestCase[];
  runSecurityTest: (testId: string) => Promise<void>;
  runAllSecurityTests: () => Promise<void>;
  resetSecurityTests: () => void;

  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Reset
  resetDemoData: () => void;
  clearLocalData: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  defaultExpiryMinutes: 15,
  maxExpiryMinutes: 15,
  emailAlertsEnabled: true,
  compactTableView: false,
  autoRefreshAuditLogs: true,
  simulationWatermark: true,
  displayName: 'Indhuja S.',
  email: 'indhuja.s@secureshare.smvec.ac.in',
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Demo Session Initialized',
    message: 'SecureShare mock control plane is active. AWS KMS and S3 storage are simulated.',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString(),
    link: '/dashboard/security-center',
  },
  {
    id: 'notif-2',
    title: 'Share Link Expiring Soon',
    message: 'Link sec-kms-rotation-4412 will expire in less than 3 minutes.',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 60000).toISOString(),
    link: '/dashboard/access-links',
  },
  {
    id: 'notif-3',
    title: 'Direct Access Blocked',
    message: 'Unauthorized crawler blocked by S3 Block Public Access rule on private prefix.',
    type: 'error',
    read: true,
    createdAt: new Date(Date.now() - 600000).toISOString(),
    link: '/dashboard/audit-logs',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Files State
  const [files, setFiles] = useState<MockFile[]>(() => {
    try {
      const saved = localStorage.getItem('secureshare_files');
      return saved ? JSON.parse(saved) : INITIAL_FILES;
    } catch {
      return INITIAL_FILES;
    }
  });

  // Share Links State
  const [shareLinks, setShareLinks] = useState<ShareLink[]>(() => {
    try {
      const saved = localStorage.getItem('secureshare_links');
      return saved ? JSON.parse(saved) : INITIAL_SHARE_LINKS;
    } catch {
      return INITIAL_SHARE_LINKS;
    }
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => {
    try {
      const saved = localStorage.getItem('secureshare_audits');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('secureshare_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Security Checklist State
  const [checklistItems, setChecklistItems] = useState<SecurityChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('secureshare_checklist');
      return saved ? JSON.parse(saved) : INITIAL_CHECKLIST_ITEMS;
    } catch {
      return INITIAL_CHECKLIST_ITEMS;
    }
  });

  // Security Test Cases State
  const [testCases, setTestCases] = useState<SecurityTestCase[]>(() => {
    try {
      const saved = localStorage.getItem('secureshare_tests');
      return saved ? JSON.parse(saved) : INITIAL_TEST_CASES;
    } catch {
      return INITIAL_TEST_CASES;
    }
  });

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('secureshare_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('secureshare_files', JSON.stringify(files));
    } catch (e) {
      console.warn(e);
    }
  }, [files]);

  useEffect(() => {
    try {
      localStorage.setItem('secureshare_links', JSON.stringify(shareLinks));
    } catch (e) {
      console.warn(e);
    }
  }, [shareLinks]);

  useEffect(() => {
    try {
      localStorage.setItem('secureshare_audits', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn(e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('secureshare_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('secureshare_checklist', JSON.stringify(checklistItems));
    } catch (e) {
      console.warn(e);
    }
  }, [checklistItems]);

  useEffect(() => {
    try {
      localStorage.setItem('secureshare_tests', JSON.stringify(testCases));
    } catch (e) {
      console.warn(e);
    }
  }, [testCases]);

  useEffect(() => {
    try {
      localStorage.setItem('secureshare_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn(e);
    }
  }, [settings]);

  // Add Audit Log Helper
  const addAuditLog = useCallback((entry: Omit<AuditEvent, 'id' | 'timestamp'>) => {
    const newLog: AuditEvent = {
      ...entry,
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  // Add Notification Helper
  const addNotification = useCallback((item: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: AppNotification = {
      ...item,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  // Live Countdown & Expiry Engine
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasChanges = false;

      setShareLinks(prevLinks => {
        return prevLinks.map(link => {
          if (link.status === 'active') {
            const expireTime = new Date(link.expiresAt).getTime();
            if (expireTime <= now) {
              hasChanges = true;
              // Log expiry event
              setTimeout(() => {
                addAuditLog({
                  actor: 'System Daemon',
                  actorRole: 'Link Lifecycle Watcher',
                  action: 'LINK_EXPIRED',
                  resource: `s3://secureshare-vault/shared/${link.fileName}`,
                  result: 'SUCCESS',
                  severity: 'info',
                  details: `Demo share token ${link.token} reached expiry duration of ${link.durationMinutes} minutes. Link marked EXPIRED.`,
                  clientIp: '127.0.0.1',
                  userAgent: 'SecureShare-Watcher/2.0',
                  awsServiceSimulated: 'CloudTrail',
                });
                addNotification({
                  title: 'Share Link Expired',
                  message: `The share link for "${link.fileName}" has expired.`,
                  type: 'warning',
                  link: '/dashboard/access-links',
                });
              }, 0);

              return { ...link, status: 'expired' };
            }
          }
          return link;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [addAuditLog, addNotification]);

  // File Operations
  const uploadFile = async (data: {
    name: string;
    size: number;
    type: string;
    extension: string;
    category: FileCategory;
    textContent?: string;
    previewUrl?: string;
    tags?: string[];
  }): Promise<MockFile> => {
    const newFile: MockFile = {
      id: `fil-${Date.now()}`,
      name: data.name,
      size: data.size,
      type: data.type || 'application/octet-stream',
      extension: data.extension || 'bin',
      category: data.category,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: 'usr-owner-001',
      ownerName: 'Indhuja S.',
      encryption: 'AWS_KMS_SSE',
      kmsKeyArn: generateSimulatedKmsKey(),
      versionId: generateSimulatedVersionId(),
      sha256Checksum: generateSimulatedSha256(data.name + Date.now()),
      isSimulated: true,
      textContent: data.textContent,
      previewUrl: data.previewUrl,
      tags: data.tags || ['DemoUpload', data.category === 'shared' ? 'SharedPrefix' : 'PrivatePrefix'],
    };

    setFiles(prev => [newFile, ...prev]);

    // Log upload to audit trail
    addAuditLog({
      actor: 'Indhuja S.',
      actorRole: 'Data Owner',
      action: 'FILE_UPLOAD',
      resource: `s3://secureshare-vault/${data.category}/${newFile.name}`,
      result: 'SUCCESS',
      severity: 'info',
      details: `Simulated upload to ${data.category}/ prefix with AWS KMS SSE (Key: ${newFile.kmsKeyArn.slice(0, 35)}...)`,
      clientIp: '49.207.18.22',
      userAgent: navigator.userAgent,
      awsServiceSimulated: 'KMS-API',
    });

    addNotification({
      title: 'File Uploaded Successfully',
      message: `"${newFile.name}" stored in ${newFile.category.toUpperCase()} vault with simulated KMS encryption.`,
      type: 'success',
      link: '/dashboard/my-files',
    });

    return newFile;
  };

  const deleteFile = (fileId: string) => {
    const target = files.find(f => f.id === fileId);
    if (!target) return;

    setFiles(prev => prev.filter(f => f.id !== fileId));

    // Also revoke associated links
    setShareLinks(prev =>
      prev.map(l => (l.fileId === fileId && l.status === 'active' ? { ...l, status: 'revoked' } : l))
    );

    addAuditLog({
      actor: 'Indhuja S.',
      actorRole: 'Data Owner',
      action: 'FILE_DELETION',
      resource: `s3://secureshare-vault/${target.category}/${target.name}`,
      result: 'SUCCESS',
      severity: 'medium',
      details: `Deleted file ${target.name} (Version: ${target.versionId}). Any associated share links were marked revoked.`,
      clientIp: '49.207.18.22',
      userAgent: navigator.userAgent,
      awsServiceSimulated: 'S3-DataEvent',
    });

    addNotification({
      title: 'File Deleted',
      message: `"${target.name}" was removed from the mock S3 vault.`,
      type: 'info',
      link: '/dashboard/my-files',
    });
  };

  const renameFile = (fileId: string, newName: string) => {
    const target = files.find(f => f.id === fileId);
    if (!target) return;

    setFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, name: newName, updatedAt: new Date().toISOString() } : f))
    );

    addAuditLog({
      actor: 'Indhuja S.',
      actorRole: 'Data Owner',
      action: 'FILE_RENAME',
      resource: `s3://secureshare-vault/${target.category}/${target.name}`,
      result: 'SUCCESS',
      severity: 'info',
      details: `Renamed object from "${target.name}" to "${newName}"`,
      clientIp: '49.207.18.22',
      userAgent: navigator.userAgent,
      awsServiceSimulated: 'CloudTrail',
    });
  };

  const moveFileCategory = (fileId: string, newCategory: FileCategory) => {
    const target = files.find(f => f.id === fileId);
    if (!target) return;

    if (target.category === newCategory) return;

    setFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, category: newCategory, updatedAt: new Date().toISOString() } : f))
    );

    // If moved from shared to private, revoke any active share links
    if (newCategory === 'private') {
      setShareLinks(prev =>
        prev.map(l => (l.fileId === fileId && l.status === 'active' ? { ...l, status: 'revoked' } : l))
      );
    }

    addAuditLog({
      actor: 'Indhuja S.',
      actorRole: 'Data Owner',
      action: 'FILE_CATEGORY_CHANGE',
      resource: `s3://secureshare-vault/${target.name}`,
      result: 'SUCCESS',
      severity: 'medium',
      details: `Relocated object from ${target.category}/ prefix to ${newCategory}/ prefix. ${
        newCategory === 'private' ? 'Active share links automatically revoked.' : 'Object is now eligible for presigned links.'
      }`,
      clientIp: '49.207.18.22',
      userAgent: navigator.userAgent,
      awsServiceSimulated: 'S3-DataEvent',
    });

    addNotification({
      title: 'Storage Category Updated',
      message: `"${target.name}" moved to ${newCategory.toUpperCase()} vault.`,
      type: 'info',
      link: '/dashboard/my-files',
    });
  };

  // Share Link Operations
  const createShareLink = (
    fileId: string,
    options: {
      durationMinutes: 5 | 10 | 15;
      recipientName?: string;
      recipientEmail?: string;
      accessNote?: string;
    }
  ): ShareLink => {
    const file = files.find(f => f.id === fileId);
    if (!file) throw new Error('File not found');

    if (file.category === 'private') {
      throw new Error('Security policy violation: Files in the Private category cannot be shared via presigned links.');
    }

    // Strict maximum expiry enforcement (15 minutes)
    const validMinutes = Math.min(options.durationMinutes, 15) as 5 | 10 | 15;
    const now = Date.now();
    const expiresAt = new Date(now + validMinutes * 60 * 1000).toISOString();
    const token = generateDemoShareToken();

    const newLink: ShareLink = {
      id: `lnk-${Date.now()}`,
      token,
      fileId: file.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      category: 'shared',
      createdByUserId: 'usr-owner-001',
      createdByUserName: 'Indhuja S.',
      recipientName: options.recipientName || 'External Recipient',
      recipientEmail: options.recipientEmail,
      accessNote: options.accessNote,
      createdAt: new Date().toISOString(),
      expiresAt,
      durationMinutes: validMinutes,
      status: 'active',
      accessCount: 0,
      downloadCount: 0,
      isSimulated: true,
    };

    setShareLinks(prev => [newLink, ...prev]);

    addAuditLog({
      actor: 'Indhuja S.',
      actorRole: 'Data Owner',
      action: 'SHARE_LINK_CREATED',
      resource: `s3://secureshare-vault/shared/${file.name}`,
      result: 'SUCCESS',
      severity: 'info',
      details: `Generated temporary demo presigned link (${validMinutes} mins duration, token: ${token})`,
      clientIp: '49.207.18.22',
      userAgent: navigator.userAgent,
      awsServiceSimulated: 'CloudTrail',
    });

    addNotification({
      title: 'Secure Share Link Created',
      message: `Presigned link for "${file.name}" created (${validMinutes}m expiry).`,
      type: 'success',
      link: '/dashboard/access-links',
    });

    return newLink;
  };

  const revokeShareLink = (linkId: string) => {
    const target = shareLinks.find(l => l.id === linkId);
    if (!target) return;

    setShareLinks(prev =>
      prev.map(l => (l.id === linkId ? { ...l, status: 'revoked' } : l))
    );

    addAuditLog({
      actor: 'Indhuja S.',
      actorRole: 'Data Owner',
      action: 'SHARE_LINK_REVOKED',
      resource: `s3://secureshare-vault/shared/${target.fileName}`,
      result: 'SUCCESS',
      severity: 'medium',
      details: `Revoked demo share link token: ${target.token}. Access has been immediately cut off.`,
      clientIp: '49.207.18.22',
      userAgent: navigator.userAgent,
      awsServiceSimulated: 'CloudTrail',
    });

    addNotification({
      title: 'Share Link Revoked',
      message: `Access link for "${target.fileName}" was revoked immediately.`,
      type: 'warning',
      link: '/dashboard/access-links',
    });
  };

  const getShareLinkByToken = (token: string): ShareLink | undefined => {
    return shareLinks.find(l => l.token === token);
  };

  const recordRecipientAccess = (token: string): { status: 'active' | 'expired' | 'revoked' | 'invalid'; link?: ShareLink } => {
    const link = shareLinks.find(l => l.token === token);
    if (!link) {
      addAuditLog({
        actor: 'External Recipient',
        actorRole: 'Recipient',
        action: 'ACCESS_DENIED',
        resource: `/recipient/demo-share/${token}`,
        result: 'BLOCKED',
        severity: 'medium',
        details: `Invalid or non-existent presigned share token submitted: ${token}`,
        clientIp: '157.48.19.12',
        userAgent: navigator.userAgent,
        awsServiceSimulated: 'IAM-Auth',
      });
      return { status: 'invalid' };
    }

    if (link.status === 'revoked') {
      addAuditLog({
        actor: 'External Recipient',
        actorRole: 'Recipient',
        action: 'ACCESS_DENIED',
        resource: `s3://secureshare-vault/shared/${link.fileName}`,
        result: 'BLOCKED',
        severity: 'medium',
        details: `Attempted access to revoked share link token: ${token}`,
        clientIp: '157.48.19.12',
        userAgent: navigator.userAgent,
        awsServiceSimulated: 'CloudTrail',
      });
      return { status: 'revoked', link };
    }

    const isExpired = new Date(link.expiresAt).getTime() <= Date.now() || link.status === 'expired';
    if (isExpired) {
      if (link.status !== 'expired') {
        setShareLinks(prev => prev.map(l => (l.id === link.id ? { ...l, status: 'expired' } : l)));
      }
      addAuditLog({
        actor: 'External Recipient',
        actorRole: 'Recipient',
        action: 'ACCESS_DENIED',
        resource: `s3://secureshare-vault/shared/${link.fileName}`,
        result: 'BLOCKED',
        severity: 'low',
        details: `Attempted access to expired presigned link token: ${token}`,
        clientIp: '157.48.19.12',
        userAgent: navigator.userAgent,
        awsServiceSimulated: 'S3-DataEvent',
      });
      return { status: 'expired', link };
    }

    // Valid access: increment counter
    setShareLinks(prev =>
      prev.map(l =>
        l.id === link.id
          ? { ...l, accessCount: l.accessCount + 1, lastAccessedAt: new Date().toISOString() }
          : l
      )
    );

    return { status: 'active', link };
  };

  const recordDownloadAttempt = (token: string): { success: boolean; reason?: string } => {
    const link = shareLinks.find(l => l.token === token);
    if (!link) {
      return { success: false, reason: 'Share link identifier is invalid or does not exist.' };
    }

    if (link.status === 'revoked') {
      return { success: false, reason: 'Access to this file has been revoked by the data owner.' };
    }

    if (new Date(link.expiresAt).getTime() <= Date.now() || link.status === 'expired') {
      return { success: false, reason: 'This presigned sharing link has expired (15m limit reached).' };
    }

    // Success
    setShareLinks(prev =>
      prev.map(l =>
        l.id === link.id
          ? { ...l, downloadCount: l.downloadCount + 1, lastAccessedAt: new Date().toISOString() }
          : l
      )
    );

    addAuditLog({
      actor: link.recipientName || 'External Recipient',
      actorRole: 'External Recipient',
      action: 'DOWNLOAD_ATTEMPT',
      resource: `s3://secureshare-vault/shared/${link.fileName}`,
      result: 'SUCCESS',
      severity: 'info',
      details: `Simulated download served for token ${token}. KMS key decrypt validated.`,
      clientIp: '157.48.19.12',
      userAgent: navigator.userAgent,
      awsServiceSimulated: 'S3-DataEvent',
    });

    addNotification({
      title: 'File Downloaded by Recipient',
      message: `"${link.fileName}" was downloaded via link ${token.slice(0, 10)}...`,
      type: 'info',
      link: '/dashboard/access-links',
    });

    return { success: true };
  };

  // Notification Operations
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
  };

  // Security Checklist
  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newReviewed = !item.reviewed;
          return {
            ...item,
            reviewed: newReviewed,
            reviewedAt: newReviewed ? new Date().toISOString() : undefined,
          };
        }
        return item;
      })
    );
  };

  // Security Verification Lab Tests
  const runSecurityTest = async (testId: string) => {
    const test = testCases.find(t => t.id === testId);
    if (!test) return;

    // Simulate network latency (250ms - 550ms)
    await new Promise(res => setTimeout(res, 350 + Math.random() * 200));

    let actualOutcome = '';
    let status: 'PASS' | 'FAIL' = 'PASS';

    switch (test.testNumber) {
      case 1:
        actualOutcome = 'HTTP 200 OK — Active token validated. Content served under TLS.';
        break;
      case 2:
        actualOutcome = 'HTTP 403 Access Denied — Direct bucket URL blocked by S3 Block Public Access.';
        break;
      case 3:
        actualOutcome = 'HTTP 403 Forbidden — Cryptographic token signature mismatch detected and denied.';
        break;
      case 4:
        actualOutcome = 'HTTP 403 Request Has Expired — Access denied; timestamp exceeded 900s boundary.';
        break;
      case 5:
        actualOutcome = 'HTTP 403 Access Revoked — Revocation record in control plane intercepted request.';
        break;
      case 6:
        actualOutcome = 'HTTP 403 Forbidden — Policy denies presigned token generation on private/ prefix.';
        break;
      case 7:
        actualOutcome = 'HTTP 403 Denied — Request lacked mandatory x-amz-server-side-encryption: aws:kms header.';
        break;
      case 8:
        actualOutcome = 'HTTP 403 Denied — Blocked by EnforceTLSRequestsOnly policy (aws:SecureTransport == false).';
        break;
      case 9:
        actualOutcome = 'HTTP 403 IAM Deny — Read-only auditor role lacks s3:PutObject or s3:DeleteObject permissions.';
        break;
      default:
        actualOutcome = 'HTTP 200 OK — Policy evaluated successfully.';
    }

    setTestCases(prev =>
      prev.map(t =>
        t.id === testId
          ? {
              ...t,
              status,
              actualOutcome,
              lastRunAt: new Date().toISOString(),
              latencyMs: Math.floor(45 + Math.random() * 70),
            }
          : t
      )
    );

    addAuditLog({
      actor: 'Security Verification Lab',
      actorRole: 'Automated Test Engine',
      action: 'SECURITY_TEST_RUN',
      resource: `Test #${test.testNumber}: ${test.title}`,
      result: status === 'PASS' ? 'SUCCESS' : 'BLOCKED',
      severity: 'info',
      details: `Evaluated policy: ${test.policyEvaluated}. Outcome: ${actualOutcome}`,
      clientIp: '127.0.0.1',
      userAgent: 'SecureShare-LabRunner/2.0',
      awsServiceSimulated: 'CloudTrail',
    });
  };

  const runAllSecurityTests = async () => {
    for (const test of testCases) {
      await runSecurityTest(test.id);
    }
  };

  const resetSecurityTests = () => {
    setTestCases(INITIAL_TEST_CASES);
  };

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addNotification({
      title: 'Settings Updated',
      message: 'Demo preferences saved successfully.',
      type: 'info',
    });
  };

  // Reset Demo Data
  const resetDemoData = () => {
    setFiles(INITIAL_FILES);
    setShareLinks(INITIAL_SHARE_LINKS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setChecklistItems(INITIAL_CHECKLIST_ITEMS);
    setTestCases(INITIAL_TEST_CASES);
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem('secureshare_files');
      localStorage.removeItem('secureshare_links');
      localStorage.removeItem('secureshare_audits');
      localStorage.removeItem('secureshare_notifications');
      localStorage.removeItem('secureshare_checklist');
      localStorage.removeItem('secureshare_tests');
      localStorage.removeItem('secureshare_settings');
    } catch (e) {
      console.warn(e);
    }
    addNotification({
      title: 'Demo Environment Reset',
      message: 'All files, links, tests and audit records restored to original demonstration state.',
      type: 'info',
    });
  };

  const clearLocalData = () => {
    setFiles([]);
    setShareLinks([]);
    setAuditLogs([]);
    setNotifications([]);
    setTestCases(INITIAL_TEST_CASES.map(t => ({ ...t, status: 'NOT_RUN', lastRunAt: undefined, actualOutcome: undefined })));
    try {
      localStorage.clear();
    } catch (e) {
      console.warn(e);
    }
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        files,
        uploadFile,
        deleteFile,
        renameFile,
        moveFileCategory,
        shareLinks,
        createShareLink,
        revokeShareLink,
        getShareLinkByToken,
        recordRecipientAccess,
        recordDownloadAttempt,
        auditLogs,
        addAuditLog,
        clearAuditLogs,
        notifications,
        unreadNotificationCount,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        checklistItems,
        toggleChecklistItem,
        testCases,
        runSecurityTest,
        runAllSecurityTests,
        resetSecurityTests,
        settings,
        updateSettings,
        resetDemoData,
        clearLocalData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
