'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDashboardPath } from '@/lib/auth';
import { PageLoader } from '@/components/ui/Spinner';

export default function DashboardRedirectPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    router.replace(getDashboardPath(user.role));
  }, [user, isAuthenticated, isLoading, router]);

  return <PageLoader message="Redirecting to your dashboard..." />;
}
