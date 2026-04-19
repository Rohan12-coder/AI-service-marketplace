'use client';
import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  title?:   string;
  children: React.ReactNode;
  size?:    'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  className?: string;
}

const sizes = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-5xl',
};

const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, title, children, size = 'md', showClose = true, className,
}) => {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        className={cn(
          'relative w-full bg-[#1A1A26] border border-[rgba(212,175,55,0.2)] rounded-2xl',
          'shadow-[0_24px_80px_rgba(0,0,0,0.8)] animate-[scaleIn_0.25s_ease_forwards]',
          'max-h-[90vh] flex flex-col',
          sizes[size],
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(212,175,55,0.1)] flex-shrink-0">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-[#F5F5F5] font-playfair">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="ml-auto text-[#9090A0] hover:text-[#F5F5F5] transition-colors p-1 rounded-lg hover:bg-white/5"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

// ── Confirm Dialog ────────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  isOpen:       boolean;
  onClose:      () => void;
  onConfirm:    () => void;
  title:        string;
  message:      string;
  confirmLabel?: string;
  cancelLabel?:  string;
  variant?:     'danger' | 'warning' | 'default';
  loading?:     boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', loading = false,
}) => {
  const colors = {
    danger:  'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    default: 'bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F]',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center py-2">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4',
          variant === 'danger' ? 'bg-red-500/15' : variant === 'warning' ? 'bg-yellow-500/15' : 'bg-[rgba(212,175,55,0.15)]'
        )}>
          <span className="text-2xl">
            {variant === 'danger' ? '⚠️' : variant === 'warning' ? '⚡' : '✦'}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2 font-playfair">{title}</h3>
        <p className="text-[#9090A0] text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[rgba(212,175,55,0.2)] text-[#C8C8D8] hover:bg-white/5 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50',
              colors[variant]
            )}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
