'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

/** Solo el equipo (rol ADMIN). El backend lo vuelve a comprobar en cada llamada. */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/equipo/ingresar?next=${encodeURIComponent(pathname)}`);
    else if (user.role !== 'ADMIN') router.replace(user.emailVerified ? '/' : '/equipo/verificar');
  }, [user, loading, router, pathname]);

  if (loading || user?.role !== 'ADMIN')
    return (
      <div className="wrap py-16" role="status">
        <span className="sr-only">Cargando…</span>
        <div className="skeleton h-40" />
      </div>
    );
  return <>{children}</>;
}
