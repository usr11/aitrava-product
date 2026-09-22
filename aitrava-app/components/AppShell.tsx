'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Icon, type IconName } from './Icon';
import { Logo } from './Logo';

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Inicio', icon: 'home' },
  { href: '/mis-viajes', label: 'Mis viajes', icon: 'ticket' },
  { href: '/crear', label: 'Crear', icon: 'plus' },
  { href: '/perfil', label: 'Perfil', icon: 'user' },
];

const isActive = (pathname: string, href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = pathname.startsWith('/admin');
  const hideNav = pathname.startsWith('/s/') || pathname.startsWith('/regalo/') || isAdmin;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur-md">
        <div className="container-app flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label="AiTrava, inicio">
            <Logo size={32} />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {NAV.filter((n) => n.href !== '/').map((n) =>
              n.href === '/crear' ? (
                <Link key={n.href} href={n.href} className="btn btn-primary ml-2 min-h-11 px-5 py-2 text-sm">
                  Crear viaje sorpresa
                </Link>
              ) : (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`btn btn-ghost text-sm ${isActive(pathname, n.href) ? 'text-text' : ''}`}
                >
                  {n.label}
                </Link>
              ),
            )}
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className={`btn btn-ghost text-sm ${isAdmin ? 'text-primary' : ''}`}>
                <Icon name="chart" size={18} /> Admin
              </Link>
            )}
          </nav>
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="btn btn-ghost text-sm md:hidden" aria-label="Panel admin">
              <Icon name="chart" size={20} />
            </Link>
          )}
        </div>
      </header>

      <main className={`flex-1 ${hideNav ? 'pb-10' : 'pb-28 md:pb-12'}`}>{children}</main>

      {!hideNav && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-board/95 backdrop-blur-md md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          aria-label="Navegación"
        >
          <ul className="grid grid-cols-4">
            {NAV.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
                      active ? 'text-primary' : 'text-muted-2'
                    }`}
                  >
                    {n.href === '/crear' ? (
                      <span className="grid size-9 place-items-center rounded-full bg-primary text-ink">
                        <Icon name="plus" size={20} strokeWidth={2.4} />
                      </span>
                    ) : (
                      <Icon name={n.icon} size={22} />
                    )}
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
