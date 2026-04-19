import { Request, Response } from 'express';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
  pagination?: Omit<PaginationResult, 'skip'>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>[];
  stack?: string;
}

// ── Distance Calculation (Haversine formula) ──────────────────────────────────
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // round to 1 decimal place
};

const toRad = (value: number): number => (value * Math.PI) / 180;

export const getDistanceLabel = (distanceKm: number): string => {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m away`;
  return `${distanceKm} km away`;
};

// ── Pagination Helper ─────────────────────────────────────────────────────────
export const getPagination = (query: PaginationQuery, total: number): PaginationResult => {
  const page  = Math.max(1, parseInt(String(query.page  || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || 10), 10)));
  const skip  = (page - 1) * limit;
  const totalPages  = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return { page, limit, skip, total, totalPages, hasNextPage, hasPrevPage };
};

// ── Response Helpers ──────────────────────────────────────────────────────────
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  pagination?: Omit<PaginationResult, 'skip'>
): Response => {
  const response: ApiSuccessResponse<T> = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: Record<string, string>[]
): Response => {
  const response: ApiErrorResponse = { success: false, message };
  if (errors) response.errors = errors;
  if (process.env.NODE_ENV === 'development') {
    response.stack = new Error().stack;
  }
  return res.status(statusCode).json(response);
};

// ── Price Formatting ──────────────────────────────────────────────────────────
export const formatPrice = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ── Date Helpers ──────────────────────────────────────────────────────────────
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  }).format(d);
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
};

export const isDateInPast = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// ── String Utilities ──────────────────────────────────────────────────────────
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

export const truncate = (text: string, length: number): string =>
  text.length > length ? `${text.substring(0, length)}...` : text;

export const capitalise = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// ── Extract Query Filters ─────────────────────────────────────────────────────
export const extractSearchParams = (req: Request) => {
  const {
    q, category, minPrice, maxPrice, rating,
    distance, lat, lng, emergency, sort,
    page, limit,
  } = req.query;

  return {
    q:         String(q || ''),
    category:  String(category || ''),
    minPrice:  parseFloat(String(minPrice || '0')),
    maxPrice:  parseFloat(String(maxPrice || '999999')),
    minRating: parseFloat(String(rating || '0')),
    distance:  parseFloat(String(distance || '50')),
    lat:       parseFloat(String(lat || '0')),
    lng:       parseFloat(String(lng || '0')),
    emergency: String(emergency) === 'true',
    sort:      String(sort || '-createdAt'),
    page:      parseInt(String(page || '1'), 10),
    limit:     parseInt(String(limit || '10'), 10),
  };
};

// ── Emergency Fee Calculator ──────────────────────────────────────────────────
export const calculateEmergencyFee = (baseAmount: number): number =>
  Math.round(baseAmount * 2 * 100) / 100; // 2x pricing for emergency

// ── Platform Commission ───────────────────────────────────────────────────────
export const PLATFORM_COMMISSION_RATE = 0.10; // 10%

export const calculateCommission = (amount: number) => {
  const commission   = Math.round(amount * PLATFORM_COMMISSION_RATE * 100) / 100;
  const providerPayout = Math.round((amount - commission) * 100) / 100;
  return { commission, providerPayout };
};

// ── Generate Receipt ID ───────────────────────────────────────────────────────
export const generateReceiptId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random    = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SSM-${timestamp}-${random}`;
};

// ── Validate Indian Phone Number ──────────────────────────────────────────────
export const isValidIndianPhone = (phone: string): boolean =>
  /^[6-9]\d{9}$/.test(phone.replace(/\s|-/g, ''));

// ── Sanitize MongoDB query (prevent injection) ────────────────────────────────
export const sanitizeQuery = (query: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};
  for (const key of Object.keys(query)) {
    const value = query[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Strip keys starting with $ to prevent MongoDB operator injection
      const nested = value as Record<string, unknown>;
      const clean: Record<string, unknown> = {};
      for (const k of Object.keys(nested)) {
        if (!k.startsWith('$')) clean[k] = nested[k];
      }
      sanitized[key] = clean;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};
