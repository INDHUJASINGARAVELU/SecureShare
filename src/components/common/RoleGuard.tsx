import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
}) => {
  const { role } = useAuth();

  if (allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
        Role-Restricted Operation
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Your current active role is <strong className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{role.replace('_', ' ')}</strong>.
        According to the simulated IAM Least-Privilege Policy, this action or section is restricted.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          Return to Overview
        </Link>
      </div>
    </div>
  );
};
