export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultExpiryMinutes: 5 | 10 | 15;
  maxExpiryMinutes: 15; // fixed as per requirement
  emailAlertsEnabled: boolean;
  compactTableView: boolean;
  autoRefreshAuditLogs: boolean;
  simulationWatermark: boolean;
  displayName: string;
  email: string;
}
