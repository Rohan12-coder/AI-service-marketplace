'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useAuthContext } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { getDashboardPath } from '@/lib/auth';

export const useAuth = () => useAuthContext();

/**
 * Redirect to login if not authenticated.
 * Redirect to dashboard if already authenticated (for guest-only pages).
 */
export const useRequireAuth = (requiredRole?: UserRole) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
      router.replace(getDashboardPath(user?.role ?? 'user'));
    }
  }, [isAuthenticated, isLoading, requiredRole, user, router]);

  return { user, isLoading };
};

export const useRedirectIfAuth = () => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user) router.replace(getDashboardPath(user.role));
  }, [isAuthenticated, isLoading, user, router]);
};

export default useAuth;
