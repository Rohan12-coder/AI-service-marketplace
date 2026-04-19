import { BookingStatus, PaymentStatus } from '@/types';

// ── Price Formatting ──────────────────────────────────────────────────────────
export const formatPrice = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPriceRange = (min: number, max: number): string =>
  min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;

// ── Date Formatting ───────────────────────────────────────────────────────────
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(d);
};

export const formatShortDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(d);
};

export const timeAgo = (date: string | Date): string => {
  const d    = typeof date === 'string' ? new Date(date) : date;
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60)   return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`;
  return formatShortDate(d);
};

// ── Text Utilities ────────────────────────────────────────────────────────────
export const truncateText = (text: string, length: number): string =>
  text.length > length ? `${text.substring(0, length)}...` : text;

export const capitalise = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const slugify = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

// ── Distance ──────────────────────────────────────────────────────────────────
export const getDistanceLabel = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)} km away`;
};

// ── Status Labels & Colors ────────────────────────────────────────────────────
export const getBookingStatusLabel = (status: BookingStatus): string => ({
  pending:      'Pending',
  accepted:     'Accepted',
  rejected:     'Rejected',
  'in-progress': 'In Progress',
  completed:    'Completed',
  cancelled:    'Cancelled',
}[status] || status);

export const getBookingStatusColor = (status: BookingStatus): string => ({
  pending:      'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  accepted:     'text-blue-400 bg-blue-400/10 border-blue-400/20',
  rejected:     'text-red-400 bg-red-400/10 border-red-400/20',
  'in-progress': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  completed:    'text-green-400 bg-green-400/10 border-green-400/20',
  cancelled:    'text-gray-400 bg-gray-400/10 border-gray-400/20',
}[status] || 'text-gray-400 bg-gray-400/10');

export const getPaymentStatusColor = (status: PaymentStatus): string => ({
  unpaid:   'text-yellow-400 bg-yellow-400/10',
  paid:     'text-green-400 bg-green-400/10',
  refunded: 'text-blue-400 bg-blue-400/10',
  failed:   'text-red-400 bg-red-400/10',
}[status] || 'text-gray-400 bg-gray-400/10');

// ── Avatar Fallback ───────────────────────────────────────────────────────────
export const getAvatarUrl = (avatar?: string, name?: string): string => {
  if (avatar) return avatar;
  const initials = (name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1A1A26&color=D4AF37&bold=true&size=128`;
};

// ── Generate time slots ───────────────────────────────────────────────────────
export const generateTimeSlots = (
  startHour = 8,
  endHour = 20,
  intervalMins = 60
): string[] => {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += intervalMins) {
      const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const endTotal = h * 60 + m + intervalMins;
      const endH = Math.floor(endTotal / 60);
      const endM = endTotal % 60;
      const end = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      slots.push(`${start} – ${end}`);
    }
  }
  return slots;
};

// ── Clamp number ──────────────────────────────────────────────────────────────
export const clamp = (val: number, min: number, max: number): number =>
  Math.min(Math.max(val, min), max);

// ── cn — conditional classnames helper ───────────────────────────────────────
export const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');

// ── Debounce ──────────────────────────────────────────────────────────────────
export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// ── Razorpay script loader ────────────────────────────────────────────────────
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== 'undefined') { resolve(true); return; }
    const script = document.createElement('script');
    script.src   = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
