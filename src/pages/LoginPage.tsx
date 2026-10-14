import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ShieldAlert, ArrowRight, UserCheck, Lock, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

export const LoginPage: React.FC = () => {
  const { loginAs, allUsers } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('data_owner');
  const [emailInput, setEmailInput] = useState('indhuja.s@secureshare.smvec.ac.in');
  const [passwordInput, setPasswordInput] = useState('••••••••••••');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const user = allUsers.find(u => u.role === role);
    if (user) {
      setEmailInput(user.email);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(selectedRole);

    if (selectedRole === 'external_recipient') {
      navigate('/recipient/demo-share/sec-arch-framework-8921');
    } else if (selectedRole === 'security_admin') {
      navigate('/dashboard/admin');
    } else if (selectedRole === 'security_auditor') {
      navigate('/dashboard/auditor');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-glow-blue">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Secure<span className="text-brand-400">Share</span>
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-white">
          Simulated Demonstration Login
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Select an IAM persona to launch an evaluated session.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Important Notice */}
          <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3.5 text-xs text-blue-200">
            <strong className="font-semibold text-white">Evaluation Notice:</strong> This is a frontend demo authentication gateway. No real passwords or AWS IAM credentials are required or processed.
          </div>

          {/* Quick Select Persona Tabs */}
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            1. Select Demo IAM Role
          </label>
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {allUsers.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleRoleSelect(user.role)}
                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                  selectedRole === user.role
                    ? 'border-brand-500 bg-brand-500/10 ring-1 ring-brand-500/50'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-bold text-white truncate">
                    {user.name}
                  </span>
                </div>
                <span className="mt-1 text-[10px] uppercase font-semibold tracking-wider text-brand-400">
                  {user.role.replace('_', ' ')}
                </span>
                {user.mfaEnabled && (
                  <span className="mt-0.5 text-[9px] text-emerald-400 font-medium">
                    &bull; MFA Enforced
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mock Credentials Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                User Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Password (Demo Token)
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-brand-500 transition-colors"
            >
              <span>Access Role Session</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              &larr; Return to Public Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
