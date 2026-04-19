'use client';
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotification, Toast, ToastType } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';

const configs: Record<ToastType, { icon: React.ReactNode; bar: string; bg: string; border: string }> = {
  success: {
    icon:   <CheckCircle size={18} className="text-green-400 flex-shrink-0" />,
    bar:    'bg-green-400',
    bg:     'bg-[#1A1A26]',
    border: 'border-green-400/20',
  },
  error: {
    icon:   <XCircle size={18} className="text-red-400 flex-shrink-0" />,
    bar:    'bg-red-400',
    bg:     'bg-[#1A1A26]',
    border: 'border-red-400/20',
  },
  warning: {
    icon:   <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0" />,
    bar:    'bg-yellow-400',
    bg:     'bg-[#1A1A26]',
    border: 'border-yellow-400/20',
  },
  info: {
    icon:   <Info size={18} className="text-blue-400 flex-shrink-0" />,
    bar:    'bg-blue-400',
    bg:     'bg-[#1A1A26]',
    border: 'border-blue-400/20',
  },
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({
  toast, onDismiss,
}) => {
  const cfg = configs[toast.type];

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 w-80 rounded-xl border shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-4 overflow-hidden',
        'animate-[toastIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)_forwards]',
        cfg.bg, cfg.border,
      )}
      role="alert"
    >
      {/* Coloured left bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl', cfg.bar)} />

      {cfg.icon}

      <div className="flex-1 min-w-0 ml-1">
        <p className="text-sm font-semibold text-[#F5F5F5] leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-[#9090A0] mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#55556A] hover:text-[#F5F5F5] transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useNotification();

  if (!toasts.length) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
};

export default ToastContainer;
