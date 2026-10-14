import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Clock,
  Key,
  FileCheck,
  Eye,
  Server,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Zap,
  FolderLock,
  ChevronRight,
  ExternalLink,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

export const LandingPage: React.FC = () => {
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const handleLaunchRole = (role: UserRole) => {
    loginAs(role);
    if (role === 'external_recipient') {
      // Open active demo share link directly
      navigate('/recipient/demo-share/sec-arch-framework-8921');
    } else if (role === 'security_admin') {
      navigate('/dashboard/admin');
    } else if (role === 'security_auditor') {
      navigate('/dashboard/auditor');
    } else {
      navigate('/dashboard');
    }
  };

  const securityLayers = [
    {
      icon: Users,
      title: 'Identity Layer (IAM)',
      desc: 'Least-privilege policies, role segregation & simulated virtual MFA (TOTP).',
    },
    {
      icon: Server,
      title: 'Storage Layer (S3)',
      desc: '100% Private S3 bucket, Block Public Access enabled, disabled ACLs & object versioning.',
    },
    {
      icon: Key,
      title: 'Encryption Layer (KMS)',
      desc: 'Envelope encryption with AWS KMS Customer Managed Keys and TLS 1.3 in-transit enforcement.',
    },
    {
      icon: Clock,
      title: 'Sharing Layer (Presigned URLs)',
      desc: 'Single-object temporary URLs strictly capped at maximum 15-minute expiry with instant revocation.',
    },
    {
      icon: Eye,
      title: 'Monitoring Layer (CloudTrail)',
      desc: 'Immutable simulated audit logging, CloudWatch anomaly alerting, and compliance tracking.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-glow-blue">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-lg">
                Secure<span className="text-brand-400">Share</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400">
                AWS Architecture Demo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Role Login
            </Link>
            <button
              onClick={() => handleLaunchRole('data_owner')}
              className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
            >
              Launch Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300 mb-6">
              <ShieldCheck className="h-4 w-4" />
              <span>College Final Defense Demonstration &bull; Frontend-Only Sandbox</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Share Files Securely. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                Stay in Total Control.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              A secure file sharing system modeled on AWS cloud security best practices: Private S3 storage buckets, AWS KMS customer-managed key encryption, strict IAM boundaries, and temporary presigned URLs capped at 15 minutes.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleLaunchRole('data_owner')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                to="/dashboard/security-center"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <span>Explore Security Layers</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Demonstration Roles Launcher */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Select a Demonstration Persona
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Test role-based access control, least-privilege policies, and interactive workflows instantly.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Data Owner */}
            <div
              onClick={() => handleLaunchRole('data_owner')}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-brand-500/60 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-brand-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <FolderLock className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-white">Data Owner</h3>
              <p className="text-[11px] text-brand-400 font-medium">Indhuja S.</p>
              <p className="mt-2 text-xs text-slate-400">
                Uploads files, moves between Private and Shared, generates 5–15m temporary presigned links.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-400">
                <span>Enter as Owner</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* External Recipient */}
            <div
              onClick={() => handleLaunchRole('external_recipient')}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-purple-500/60 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-white">External Recipient</h3>
              <p className="text-[11px] text-purple-400 font-medium">Partner / Auditor</p>
              <p className="mt-2 text-xs text-slate-400">
                Accesses temporary presigned link. Views countdown timer, file details & simulated download.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-400">
                <span>Open Recipient Portal</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Security Admin */}
            <div
              onClick={() => handleLaunchRole('security_admin')}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-emerald-500/60 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-white">Security Admin</h3>
              <p className="text-[11px] text-emerald-400 font-medium">Vikram Malhotra</p>
              <p className="mt-2 text-xs text-slate-400">
                Access management, toggle simulated MFA, configure KMS policy reviews & inspect health.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <span>Enter as Admin</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Security Auditor */}
            <div
              onClick={() => handleLaunchRole('security_auditor')}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-amber-500/60 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-white">Security Auditor</h3>
              <p className="text-[11px] text-amber-400 font-medium">Ananya Sharma</p>
              <p className="mt-2 text-xs text-slate-400">
                Strict read-only role. Inspects CloudTrail telemetry, verifies security lab tests & exports CSV.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400">
                <span>Enter as Auditor</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture Workflow Visualizer */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            End-to-End Secure File Lifecycle
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            How a file travels through the simulated AWS cybersecurity layers from upload to expiry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <span className="text-xs font-bold font-mono text-brand-400">01. INGESTION</span>
            <h4 className="mt-2 text-base font-bold text-white">Encrypted Upload</h4>
            <p className="mt-2 text-xs text-slate-400">
              File uploaded over TLS. S3 bucket policy strictly rejects unencrypted payloads without SSE-KMS headers.
            </p>
          </div>

          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <span className="text-xs font-bold font-mono text-brand-400">02. VAULT STORAGE</span>
            <h4 className="mt-2 text-base font-bold text-white">Private S3 Prefix</h4>
            <p className="mt-2 text-xs text-slate-400">
              Stored in private bucket with Block Public Access active. Versioning preserves historical integrity.
            </p>
          </div>

          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <span className="text-xs font-bold font-mono text-brand-400">03. TIME-BOUND SHARING</span>
            <h4 className="mt-2 text-base font-bold text-white">Presigned URL Token</h4>
            <p className="mt-2 text-xs text-slate-400">
              Only files in shared/ prefix can be presigned. Time-to-live is capped at 15 minutes max with live timer.
            </p>
          </div>

          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <span className="text-xs font-bold font-mono text-brand-400">04. EXPIRY & REVOCATION</span>
            <h4 className="mt-2 text-base font-bold text-white">Instant Cut-off</h4>
            <p className="mt-2 text-xs text-slate-400">
              Expired or owner-revoked tokens return HTTP 403. All events stream into CloudTrail audit log.
            </p>
          </div>
        </div>
      </section>

      {/* 5 Security Layers Summary */}
      <section className="py-16 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              The 5 Security Architecture Layers
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Derived from the project technical specification and AWS Well-Architected Framework.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {securityLayers.map((layer, idx) => {
              const Icon = layer.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-3">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white">{layer.title}</h3>
                  <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
                    {layer.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* College Project Attribution Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-400" />
              <span className="font-bold text-white">SecureShare</span>
              <span className="text-[10px] text-slate-500">&bull; Frontend Demonstration</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Secure File Sharing System on AWS Using Private S3 Storage, KMS Encryption, IAM Policies and Presigned URLs.
            </p>
          </div>

          <div className="text-right text-[11px] space-y-1">
            <p className="font-semibold text-slate-200">
              Student: Indhuja S.
            </p>
            <p className="text-slate-400">
              Department: Artificial Intelligence and Data Science
            </p>
            <p className="text-slate-400">
              Institution: Sri Manakula Vinayagar Engineering College
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
