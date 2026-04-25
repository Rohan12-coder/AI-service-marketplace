'use client';
import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  onIconRightClick?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, icon, iconRight, onIconRightClick,
  className, id, ...props
}, ref) => {

  const reactId = useId();
  const inputId = id || reactId;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[#C8C8D8]"
        >
          {label}
          {props.required && <span className="text-[#D4AF37] ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-[#9090A0] flex items-center pointer-events-none">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-[#12121A] border rounded-lg text-[#F5F5F5] placeholder-[#55556A]',
            'text-sm transition-all duration-200 focus:outline-none',
            'border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] focus:ring-2 focus:ring-[rgba(212,175,55,0.12)]',
            icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5',
            iconRight ? 'pr-10' : '',
            error ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/10' : '',
            props.disabled ? 'opacity-50 cursor-not-allowed' : '',
            className,
          )}
          {...props}
        />

        {iconRight && (
          <button
            type="button"
            onClick={onIconRightClick}
            className="absolute right-3 text-[#9090A0] hover:text-[#D4AF37] transition-colors flex items-center"
            tabIndex={-1}
          >
            {iconRight}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-[#9090A0]">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

// ── Textarea variant ─────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label, error, hint, className, id, ...props
}, ref) => {

  const reactId = useId();
  const inputId = id || reactId;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#C8C8D8]">
          {label}
          {props.required && <span className="text-[#D4AF37] ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'w-full bg-[#12121A] border border-[rgba(212,175,55,0.2)] rounded-lg px-4 py-2.5',
          'text-sm text-[#F5F5F5] placeholder-[#55556A] resize-none transition-all duration-200',
          'focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[rgba(212,175,55,0.12)]',
          error ? 'border-red-500/60' : '',
          className,
        )}
        {...props}
      />

      {error && <p className="text-xs text-red-400">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-[#9090A0]">{hint}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';