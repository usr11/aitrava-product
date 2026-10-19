'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { pickCurrentTrip, useMyTrips } from '@/lib/trips';
import { Icon, type IconName } from './Icon';

/** Rutas donde la barra inferior no se muestra. */
export const hideBottomNav = (pathname: string) =>
  pathname.startsWith('/admin') ||
  pathname.startsWith('/registro') ||
  pathname.startsWith('/iniciar-sesion') ||
  pathname.startsWith('/verificar-correo') ||
  pathname.startsWith('/recuperar-contrasena') ||
  pathname.startsWith('/restablecer-contrasena') ||
  pathname.startsWith('/planear') ||
  pathname.startsWith('/checkout');

/** Barra inferior en móvil, solo con sesión: [Inicio] [Mi Viaje] [Explorar] [Bóveda] [Perfil]. */
export function MobileNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { trips } = useMyTrips();
  if (!user || hideBottomNav(pathname)) return null;

  const current = pickCurrentTrip(trips, pathname);
  const currentTrip = trips?.find((t) => t.id === current);
  const tripHref = current ? `/viajes/${current}` : '/mis-viajes';
  const exploreHref = current && currentTrip?.phase === 'active' ? `/viajes/${current}/modo-viaje#cerca` : '/destinos';

  const items: { href: string; label: string; icon: IconName; active: boolean }[] = [
    { href: '/', label: 'Inicio', icon: 'home', active: pathname === '/' },
    {
      href: tripHref,
      label: 'Mi Viaje',
      icon: 'plane',
      active: (pathname.startsWith('/viajes/') && !/\/(boveda|modo-viaje)/.test(pathname)) || pathname === '/mis-viajes',
    },
    { href: exploreHref, label: 'Explorar', icon: 'compass', active: pathname.endsWith('/modo-viaje') || pathname === '/destinos' },
    { href: current ? `/viajes/${current}/boveda` : '/mis-viajes', label: 'Bóveda', icon: 'vault', active: pathname.endsWith('/boveda') },
    { href: '/mi-cuenta', label: 'Perfil', icon: 'user', active: pathname.startsWith('/mi-cuenta') },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md lg:hidden print:hidden"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
      aria-label="Navegación de la app"
    >
      <ul className="grid h-[var(--bottom-nav)] grid-cols-5">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              href={it.href}
              aria-current={it.active ? 'page' : undefined}
              className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold ${it.active ? 'text-navy' : 'text-text-3'}`}
            >
              <span className={`grid h-7 w-12 place-items-center rounded-full transition ${it.active ? 'bg-yellow' : ''}`}>
                <Icon name={it.icon} size={21} strokeWidth={it.active ? 2.1 : 1.8} />
              </span>
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
