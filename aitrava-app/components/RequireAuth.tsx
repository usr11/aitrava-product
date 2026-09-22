'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Spinner } from './Spinner';

export function RequireAuth({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    else if (admin && user.role !== 'ADMIN') router.replace('/');
  }, [user, loading, admin, router]);

  if (loading || !user || (admin && user.role !== 'ADMIN')) return <Spinner full />;
  return <>{children}</>;
}
