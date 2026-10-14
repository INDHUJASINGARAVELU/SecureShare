import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Sun,
  Moon,
  ShieldCheck,
  Menu,
  ChevronRight,
  CheckCircle2,
  File,
  Lock,
  ExternalLink,
  User as UserIcon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { NotificationPanel } from './NotificationPanel';
import { formatBytes } from '../../utils/formatters';

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, role } = useAuth();
  const { files, shareLinks, unreadNotificationCount } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter files by search query
  const matchingFiles = searchQuery.trim()
    ? files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // Breadcrumbs builder
  const pathnames = location.pathname.split('/').filter(x => x);

  const getBreadcrumbTitle = (path: string) => {
    switch (path) {
      case 'dashboard':
        return 'Overview';
      case 'my-files':
        return 'My Files';
      case 'upload':
        return 'Upload Files';
      case 'share':
        return 'Secure Sharing';
      case 'access-links':
        return 'Access Links';
      case 'security-center':
        return 'Security Center';
      case 'security-lab':
        return 'Security Lab';
      case 'audit-logs':
        return 'Audit Logs';
      case 'admin':
        return 'Access Management';
      case 'auditor':
        return 'Auditor Portal';
      case 'settings':
        return 'Settings';
      case 'help':
        return 'Help & Info';
      default:
        return path;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 md:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            SecureShare
          </Link>
          {pathnames.map((segment, idx) => {
            const to = `/${pathnames.slice(0, idx + 1).join('/')}`;
            const isLast = idx === pathnames.length - 1;
            return (
              <React.Fragment key={to}>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                {isLast ? (
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">
                    {getBreadcrumbTitle(segment)}
                  </span>
                ) : (
                  <Link to={to} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors capitalize">
                    {getBreadcrumbTitle(segment)}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center: Global Search Bar */}
      <div ref={searchRef} className="relative hidden md:block w-72 lg:w-96">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search files, KMS keys, or links..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-xs text-slate-900 transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute left-0 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
            <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Matching Files ({matchingFiles.length})
            </p>
            {matchingFiles.length > 0 ? (
              <div className="mt-1 max-h-60 overflow-y-auto space-y-1">
                {matchingFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      navigate('/dashboard/my-files');
                    }}
                    className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <File className="h-4 w-4 shrink-0 text-brand-500" />
                      <span className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 shrink-0">
                      <span>{formatBytes(file.size)}</span>
                      <span className="rounded bg-slate-100 px-1 py-0.5 uppercase dark:bg-slate-800 font-mono">
                        {file.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-xs text-slate-500">
                No matching files found.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right: Security Status, Notifications, Theme, User */}
      <div className="flex items-center gap-3">
        {/* Security Health Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>S3 Vault: Block Public Access Active</span>
        </div>

        {/* Date / Greeting */}
        <div className="hidden xl:block text-right">
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            {getGreeting()}, {currentUser.name.split(' ')[0]}
          </p>
          <p className="text-[10px] text-slate-400">{formattedDate}</p>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <NotificationPanel onClose={() => setIsNotifOpen(false)} />
          )}
        </div>

        {/* User Avatar Mini */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-8 w-8 rounded-full object-cover border border-brand-500/40"
          />
        </div>
      </div>
    </header>
  );
};
