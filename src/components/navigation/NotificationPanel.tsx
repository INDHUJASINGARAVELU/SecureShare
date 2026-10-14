import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertOctagon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useApp();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertOctagon className="h-4 w-4 text-rose-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Security Notifications
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllNotificationsRead}
                className="rounded-lg p-1 text-slate-400 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
              <button
                onClick={clearNotifications}
                className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Clear all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 max-h-80 overflow-y-auto space-y-2 scrollbar-thin">
        {notifications.length > 0 ? (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationRead(item.id);
                if (item.link) {
                  navigate(item.link);
                  onClose();
                }
              }}
              className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors cursor-pointer border ${
                item.read
                  ? 'border-transparent bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  : 'border-blue-100 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20'
              }`}
            >
              <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {item.message}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No active notifications
          </div>
        )}
      </div>
    </div>
  );
};
