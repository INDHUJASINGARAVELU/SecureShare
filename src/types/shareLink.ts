export type ShareLinkStatus = 'active' | 'expired' | 'revoked';

export interface ShareLink {
  id: string;
  token: string; // unique demo identifier for /recipient/demo-share/:token
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: 'shared';
  createdByUserId: string;
  createdByUserName: string;
  recipientName?: string;
  recipientEmail?: string;
  accessNote?: string;
  createdAt: string; // ISO date
  expiresAt: string; // ISO date
  durationMinutes: 5 | 10 | 15;
  status: ShareLinkStatus;
  accessCount: number;
  downloadCount: number;
  lastAccessedAt?: string;
  isSimulated: boolean;
}
