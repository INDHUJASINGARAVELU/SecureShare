import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  FolderLock,
  UploadCloud,
  Share2,
  Link2,
  ShieldCheck,
  FlaskConical,
  FileText,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  UserCheck,
  Eye,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const { currentUser, role, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      title: 'Overview',
      to: '/dashboard',
      icon: LayoutDashboard,
      roles: ['data_owner', 'security_admin', 'security_auditor', 'external_recipient'],
    },
    {
      title: 'My Files',
      to: '/dashboard/my-files',
      icon: FolderLock,
      roles: ['data_owner', 'security_admin'],
    },
    {
      title: 'Upload Files',
      to: '/dashboard/upload',
      icon: UploadCloud,
      roles: ['data_owner'],
    },
    {
      title: 'Secure Sharing',
      to: '/dashboard/share',
      icon: Share2,
      roles: ['data_owner'],
    },
    {
      title: 'Access Links',
      to: '/dashboard/access-links',
      icon: Link2,
      roles: ['data_owner', 'security_admin'],
    },
    {
      title: 'Security Center',
      to: '/dashboard/security-center',
      icon: ShieldCheck,
      roles: ['data_owner', 'security_admin', 'security_auditor'],
    },
    {
      title: 'Security Lab',
      to: '/dashboard/security-lab',
      icon: FlaskConical,
      roles: ['data_owner', 'security_admin', 'security_auditor'],
    },
    {
      title: 'Audit Logs',
      to: '/dashboard/audit-logs',
      icon: FileText,
      roles: ['data_owner', 'security_admin', 'security_auditor'],
    },
    {
      title: 'Access Mgmt',
      to: '/dashboard/admin',
      icon: Users,
      roles: ['security_admin'],
      badge: 'Admin',
    },
    {
      title: 'Auditor View',
      to: '/dashboard/auditor',
      icon: Eye,
      roles: ['security_auditor', 'security_admin'],
      badge: 'Audit',
    },
    {
      title: 'Settings',
      to: '/dashboard/settings',
      icon: Settings,
      roles: ['data_owner', 'security_admin', 'security_auditor'],
    },
    {
      title: 'Help & Project Info',
      to: '/dashboard/help',
      icon: HelpCircle,
      roles: ['data_owner', 'security_admin', 'security_auditor', 'external_recipient'],
    },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  const roleLabels: Record<string, { label: string; color: string }> = {
    data_owner: { label: 'Data Owner', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    security_admin: { label: 'SecOps Admin', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    security_auditor: { label: 'Sec Auditor', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    external_recipient: { label: 'Recipient', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  };

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col justify-between border-r border-sidebar-border bg-sidebar-dark text-slate-300 transition-all duration-300 select-none z-20',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border/80 px-4">
        <NavLink
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-glow-blue">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold tracking-tight text-white text-base">
                Secure<span className="text-brand-400">Share</span>
              </span>
              <span className="block text-[10px] font-medium tracking-wider uppercase text-slate-400">
                AWS Vault Demo
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Role Indicator Banner */}
      {!collapsed && (
        <div className="mx-3 mt-3 rounded-xl border border-sidebar-border bg-sidebar-card/60 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Active IAM Role</span>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide',
                roleLabels[role]?.color
              )}
            >
              {roleLabels[role]?.label}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Simulated MFA:</span>
            <span className={currentUser.mfaEnabled ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
              {currentUser.mfaEnabled ? 'Enforced (TOTP)' : 'Optional'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
        {visibleItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-sidebar-hover hover:text-slate-200'
                )
              }
              title={collapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="rounded-md bg-sidebar-card border border-sidebar-border px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Role Switcher & User Profile */}
      <div className="border-t border-sidebar-border/80 p-3 bg-sidebar-darker/60 space-y-2">
        {!collapsed && (
          <div className="px-1 pt-1">
            <label className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Quick Role Switch (Demo)
            </label>
            <select
              value={role}
              onChange={e => switchRole(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-sidebar-border bg-sidebar-card px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="data_owner">Data Owner (Indhuja S.)</option>
              <option value="security_admin">Security Admin (Vikram M.)</option>
              <option value="security_auditor">Security Auditor (Ananya S.)</option>
              <option value="external_recipient">External Recipient (Partner)</option>
            </select>
          </div>
        )}

        {/* User Card */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-sidebar-card',
            collapsed && 'justify-center'
          )}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-9 w-9 rounded-full object-cover border border-slate-700 shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {currentUser.name}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                {currentUser.email}
              </p>
            </div>
          )}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-slate-400 hover:text-rose-400 transition-colors p-1"
            title="Simulated Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
