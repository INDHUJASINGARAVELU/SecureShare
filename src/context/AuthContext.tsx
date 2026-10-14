import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import { INITIAL_USERS } from '../data/initialUsers';

interface AuthContextType {
  currentUser: User;
  role: UserRole;
  isAuthenticated: boolean;
  mfaVerified: boolean;
  isMfaModalOpen: boolean;
  switchRole: (role: UserRole) => void;
  loginAs: (role: UserRole) => void;
  verifyMfaCode: (code: string) => boolean;
  openMfaModal: () => void;
  closeMfaModal: () => void;
  logout: () => void;
  allUsers: User[];
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  toggleUserMfa: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'secureshare_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('secureshare_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = users.find(u => u.id === parsed.id);
        if (match) return match;
      }
    } catch (e) {
      console.warn('Error reading auth state', e);
    }
    return users[0]; // default: Indhuja S. (Data Owner)
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [mfaVerified, setMfaVerified] = useState<boolean>(true);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('secureshare_users', JSON.stringify(users));
    } catch (e) {
      console.warn(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } catch (e) {
      console.warn(e);
    }
  }, [currentUser]);

  const switchRole = (newRole: UserRole) => {
    const target = users.find(u => u.role === newRole) || users[0];
    setCurrentUser(target);
    setIsAuthenticated(true);
    setMfaVerified(true);
  };

  const loginAs = (targetRole: UserRole) => {
    const target = users.find(u => u.role === targetRole) || users[0];
    setCurrentUser(target);
    setIsAuthenticated(true);
    if (target.mfaEnabled) {
      setMfaVerified(false);
      setIsMfaModalOpen(true);
    } else {
      setMfaVerified(true);
    }
  };

  const verifyMfaCode = (code: string): boolean => {
    // In demo simulation, any 6-digit code or "123456" is considered valid
    if (code.trim().length === 6) {
      setMfaVerified(true);
      setIsMfaModalOpen(false);
      return true;
    }
    return false;
  };

  const openMfaModal = () => setIsMfaModalOpen(true);
  const closeMfaModal = () => setIsMfaModalOpen(false);

  const logout = () => {
    setIsAuthenticated(false);
    setMfaVerified(false);
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended') => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, status } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, status }));
    }
  };

  const toggleUserMfa = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, mfaEnabled: !u.mfaEnabled } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, mfaEnabled: !prev.mfaEnabled }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser.role,
        isAuthenticated,
        mfaVerified,
        isMfaModalOpen,
        switchRole,
        loginAs,
        verifyMfaCode,
        openMfaModal,
        closeMfaModal,
        logout,
        allUsers: users,
        updateUserStatus,
        toggleUserMfa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
