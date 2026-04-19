'use client';
import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, Loader } from 'lucide-react';
import { BookingStatus as TStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_STEPS: TStatus[] = ['pending', 'accepted', 'in-progress', 'completed'];

const STATUS_META: Record<TStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending:      { label: 'Pending',     icon: <Clock      size={16} />, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  accepted:     { label: 'Accepted',    icon: <CheckCircle size={16} />, color: 'text-blue-400   bg-blue-400/10   border-blue-400/20'   },
  'in-progress':{ label: 'In Progress', icon: <Loader     size={16} className="animate-spin" />, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  completed:    { label: 'Completed',   icon: <CheckCircle size={16} />, color: 'text-green-400  bg-green-400/10  border-green-400/20'  },
  rejected:     { label: 'Rejected',    icon: <XCircle    size={16} />, color: 'text-red-400    bg-red-400/10    border-red-400/20'    },
  cancelled:    { label: 'Cancelled',   icon: <AlertCircle size={16} />, color: 'text-gray-400  bg-gray-400/10  border-gray-400/20'   },
};

interface BookingStatusProps {
  status:    TStatus;
  className?: string;
  compact?:  boolean;
}

const BookingStatusComp: React.FC<BookingStatusProps> = ({ status, className, compact = false }) => {
  const meta = STATUS_META[status];

  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', meta.color, className)}>
        {meta.icon} {meta.label}
      </span>
    );
  }

  const isTerminal = ['rejected', 'cancelled'].includes(status);

  if (isTerminal) {
    return (
      <div className={cn('flex items-center gap-3 p-4 rounded-xl border', meta.color, className)}>
        {meta.icon}
        <div>
          <p className="font-semibold text-sm">Booking {meta.label}</p>
          {status === 'cancelled' && <p className="text-xs opacity-80 mt-0.5">This booking has been cancelled.</p>}
          {status === 'rejected'  && <p className="text-xs opacity-80 mt-0.5">The provider was unable to accept this booking.</p>}
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className={cn('bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5', className)}>
      <h3 className="font-semibold text-[#F5F5F5] text-sm mb-4">Booking Status</h3>
      <div className="flex items-center">
        {STATUS_STEPS.map((s, i) => {
          const m       = STATUS_META[s];
          const done    = i < currentIdx;
          const current = i === currentIdx;
          const future  = i > currentIdx;

          return (
            <React.Fragment key={s}>
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all',
                  done    ? 'bg-green-400/15  border-green-400  text-green-400'  :
                  current ? 'bg-[rgba(212,175,55,0.15)] border-[#D4AF37] text-[#D4AF37]' :
                            'bg-[#12121A]     border-[#2A2A3A]  text-[#55556A]',
                )}>
                  {done ? <CheckCircle size={16} /> : m.icon}
                </div>
                <span className={cn('text-[10px] font-medium text-center max-w-[60px] leading-tight',
                  done    ? 'text-green-400' : current ? 'text-[#D4AF37]' : 'text-[#55556A]')}>
                  {m.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STATUS_STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-2 mb-5 transition-all', done || current ? 'bg-[#D4AF37]/40' : 'bg-[#2A2A3A]')} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStatusComp;
