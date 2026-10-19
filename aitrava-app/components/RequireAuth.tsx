'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useConfig } from '@/lib/config';
import { Icon } from './Icon';
import { LoadingState } from './ui';

/**
 * Protege una pantalla: sin sesión → iniciar sesión; sin correo verificado → aviso;
 * admin → solo rol ADMIN (el backend lo vuelve a comprobar en cada llamada).
 */
export function RequireAuth({
  children,
  admin = false,
  verified = true,
}: {
  children: React.ReactNode;
  admin?: boolean;
  verified?: boolean;
}) {
  const { user, loading } = useAuth();
  const config = useConfig();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/iniciar-sesion?next=${encodeURIComponent(pathname)}`);
    else if (admin && user.role !== 'ADMIN') router.replace('/');
  }, [user, loading, admin, router, pathname]);

  if (loading || !user || (admin && user.role !== 'ADMIN')) {
    return (
      <div className="container-app py-10">
        <LoadingState label="Cargando…" />
      </div>
    );
  }
  // Solo se bloquea si el servidor exige verificar (en la fase de prueba no). El backend lo vuelve a comprobar.
  if (verified && !user.emailVerified && config?.emailVerificationRequired) {
    return (
      <div className="container-app flex min-h-[60dvh] items-center justify-center py-10">
        <div className="card max-w-md p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-sky text-blue">
            <Icon name="mail" size={26} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-navy">Verifica tu correo</h1>
          <p className="mt-2 text-text-2">
            Para crear y ver tus viajes necesitamos confirmar que <strong>{user.email}</strong> es tuyo.
          </p>
          <Link href="/verificar-correo" className="btn btn-navy mt-6 w-full">
            Ir a verificar mi correo
          </Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
