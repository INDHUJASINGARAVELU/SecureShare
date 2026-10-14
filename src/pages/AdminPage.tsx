import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Lock,
  KeyRound,
  ShieldAlert,
  FolderLock,
  Link2,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Server,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types/auth';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';

export const AdminPage: React.FC = () => {
  const { allUsers, updateUserStatus, toggleUserMfa, switchRole } = useAuth();
  const { files, shareLinks, auditLogs, testCases } = useApp();

  const totalUsers = allUsers.length;
  const activeLinks = shareLinks.filter(l => l.status === 'active').length;
  const deniedRequests = auditLogs.filter(l => l.result === 'BLOCKED' || l.result === 'DENIED').length;
  const passedTests = testCases.filter(t => t.status === 'PASS').length;

  const rolePermissions: Record<UserRole, { title: string; permissions: string[] }> = {
    data_owner: {
      title: 'Data Owner Policy',
      permissions: [
        's3:PutObject (Shared & Private prefixes)',
        's3:GetObject (All owned objects)',
        's3:DeleteObject (All owned objects)',
        'kms:GenerateDataKey',
        'presign:CreateShareLink (Shared prefix max 15m)',
        'presign:RevokeShareLink',
      ],
    },
    security_admin: {
      title: 'Security Administrator Policy',
      permissions: [
        'iam:GetRolePolicy, iam:UpdateUserMFA',
        'kms:DescribeKey, kms:EnableKeyRotation',
        's3:GetBucketPolicy, s3:GetBucketAcl',
        'cloudtrail:DescribeTrails, cloudtrail:GetEventSelectors',
        'secureshare:ManageUsers',
      ],
    },
    security_auditor: {
      title: 'Security Compliance Auditor Policy (Strict Read-Only)',
      permissions: [
        'cloudtrail:LookupEvents (Read-Only)',
        's3:ListBucket (Metadata inspection)',
        'kms:DescribeKey (No decrypt rights)',
        'audit:ExportCsvReports',
        'DENY: s3:PutObject, s3:DeleteObject, presign:CreateShareLink',
      ],
    },
    external_recipient: {
      title: 'External Recipient Delegate',
      permissions: [
        's3:GetObject (Only via valid, unexpired presigned URL)',
        'kms:Decrypt (Via presigned context)',
        'DENY: All direct S3 API or control-plane access',
      ],
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Security Administration & Access Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage IAM identities, simulated MFA enforcement, role policies and system security postures.
        </p>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Demo Users"
          value={totalUsers}
          subtitle="Configured IAM Roles"
          icon={Users}
          variant="blue"
        />
        <StatCard
          title="Active Share Links"
          value={activeLinks}
          subtitle="Currently Presigned"
          icon={Link2}
          variant="emerald"
        />
        <StatCard
          title="Denied Requests"
          value={deniedRequests}
          subtitle="Intercepted by Policies"
          icon={ShieldAlert}
          variant="rose"
        />
        <StatCard
          title="Lab Tests Passed"
          value={`${passedTests}/${testCases.length}`}
          subtitle="Verification Baseline"
          icon={ShieldCheck}
          variant="indigo"
        />
      </div>

      {/* User & Role Management Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            IAM User Profiles & Credential Controls
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure simulated virtual MFA enforcement and session access state per persona.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
              <tr>
                <th className="py-3 pl-4 pr-3">Identity</th>
                <th className="py-3 px-3">Role Assigned</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Simulated MFA</th>
                <th className="py-3 px-3">Account Status</th>
                <th className="py-3 pr-4 text-right">Quick Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <Badge variant="blue" size="sm">
                      {user.role.toUpperCase().replace('_', ' ')}
                    </Badge>
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {user.department}
                  </td>

                  <td className="py-3 px-3">
                    <button
                      onClick={() => toggleUserMfa(user.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                        user.mfaEnabled
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <KeyRound className="h-3 w-3" />
                      <span>{user.mfaEnabled ? 'MFA Active' : 'Disabled'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-3">
                    <button
                      onClick={() =>
                        updateUserStatus(
                          user.id,
                          user.status === 'active' ? 'suspended' : 'active'
                        )
                      }
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-semibold ${
                        user.status === 'active'
                          ? 'text-emerald-600'
                          : 'text-rose-500'
                      }`}
                    >
                      {user.status === 'active' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      <span className="capitalize">{user.status}</span>
                    </button>
                  </td>

                  <td className="py-3 pr-4 text-right">
                    <button
                      onClick={() => switchRole(user.role)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Act as User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Policy Summaries */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          IAM Role Boundaries & Least-Privilege Policies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(rolePermissions) as [UserRole, { title: string; permissions: string[] }][]).map(
            ([rKey, p]) => (
              <div
                key={rKey}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {p.title}
                  </h3>
                  <Badge variant="slate" size="sm">
                    {rKey}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1.5">
                  {p.permissions.map((perm, idx) => (
                    <div
                      key={idx}
                      className={`text-[11px] font-mono p-1.5 rounded flex items-center gap-1.5 ${
                        perm.startsWith('DENY')
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                          : 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300'
                      }`}
                    >
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
