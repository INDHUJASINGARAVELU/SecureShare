export type UserRole = 'data_owner' | 'external_recipient' | 'security_admin' | 'security_auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  mfaEnabled: boolean;
  department: string;
  status: 'active' | 'suspended';
  lastActive: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  mfaRequired: boolean;
  mfaVerified: boolean;
}
