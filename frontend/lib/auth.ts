import { IUser, UserRole } from '@/types';

const TOKEN_KEY = 'ssm_token';
const USER_KEY  = 'ssm_user';

// ── Token Storage ─────────────────────────────────────────────────────────────
export const saveToken = (token: string): void => {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') return localStorage.getItem(TOKEN_KEY);
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
};

// ── User Storage ──────────────────────────────────────────────────────────────
export const saveUser = (user: IUser): void => {
  if (typeof window !== 'undefined')
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getSavedUser = (): IUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as IUser) : null;
  } catch {
    return null;
  }
};

export const removeUser = (): void => {
  if (typeof window !== 'undefined') localStorage.removeItem(USER_KEY);
};

// ── Clear All Auth Data ───────────────────────────────────────────────────────
export const clearAuth = (): void => {
  removeToken();
  removeUser();
};

// ── Role Checks ───────────────────────────────────────────────────────────────
export const isAdmin    = (user: IUser | null): boolean => user?.role === 'admin';
export const isProvider = (user: IUser | null): boolean =>
  user?.role === 'provider' || user?.role === 'admin';
export const isUser     = (user: IUser | null): boolean => !!user;

// ── Role-based redirect path ──────────────────────────────────────────────────
export const getDashboardPath = (role: UserRole): string => {
  switch (role) {
    case 'admin':    return '/dashboard/admin';
    case 'provider': return '/dashboard/provider';
    default:         return '/dashboard/user';
  }
};

// ── JWT Decode (client-side, no verification) ─────────────────────────────────
export const decodeToken = (token: string): { id: string; role: string; email: string; exp: number } | null => {
  try {
    const base64Payload = token.split('.')[1];
    const decoded = JSON.parse(atob(base64Payload));
    return decoded;
  } catch {
    return null;
  }
};

// ── Check token expiry ────────────────────────────────────────────────────────
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
};

// ── Format display name ───────────────────────────────────────────────────────
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
