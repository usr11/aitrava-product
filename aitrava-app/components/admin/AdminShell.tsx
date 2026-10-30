'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { lockScroll } from '@/lib/scroll-lock';
import { Icon, type IconName } from '../Icon';
import { Logo } from '../Logo';
import { RequireAdmin } from '../RequireAuth';

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin', label: 'Tablero', icon: 'target' },
  { href: '/admin/salidas', label: 'Salidas', icon: 'calendar' },
  { href: '/admin/reservas', label: 'Reservas', icon: 'ticket' },
  { href: '/admin/anfitriones', label: 'Anfitriones', icon: 'users' },
  { href: '/admin/espera', label: 'Lista de espera', icon: 'list' },
  { href: '/admin/lugares', label: 'Lugares', icon: 'mountain' },
  { href: '/admin/costos', label: 'Costos y pauta', icon: 'receipt' },
  { href: '/admin/finanzas', label: 'Finanzas reales', icon: 'wallet' },
  { href: '/admin/modelo', label: 'Modelo financiero', icon: 'chart' },
  { href: '/admin/ajustes', label: 'Registro de ajustes', icon: 'refresh' },
  { href: '/admin/equipo', label: 'Equipo', icon: 'settings' },
];

const active = (p: string, href: string) => (href === '/admin' ? p === '/admin' : p.startsWith(href));

function Nav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Panel" className="flex flex-col gap-0.5">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          aria-current={active(pathname, n.href) ? 'page' : undefined}
          className={`flex min-h-11 items-center gap-3 rounded-lg px-3 font-semibold transition-colors ${active(pathname, n.href) ? 'bg-pine-2 text-paper' : 'text-on-pine-2 hover:bg-pine-2 hover:text-paper'}`}
        >
          <Icon name={n.icon} size={19} />
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => (open ? lockScroll() : undefined), [open]);

  const logout = () => {
    signOut();
    router.push('/');
  };
  const footer = (
    <div className="mt-auto space-y-1 border-t border-pine-3 pt-4 text-sm">
      <p className="truncate px-3 text-on-pine-2">{user?.email}</p>
      <Link href="/" className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-on-pine-2 hover:text-paper">
        <Icon name="externalLink" size={17} /> Ver el sitio
      </Link>
      <button onClick={logout} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-on-pine-2 hover:text-paper">
        <Icon name="logout" size={17} /> Cerrar sesión
      </button>
    </div>
  );

  return (
    <RequireAdmin>
      <div className="min-h-dvh lg:grid lg:grid-cols-[250px_1fr]">
        <aside className="sticky top-0 hidden h-dvh flex-col gap-6 overflow-y-auto bg-pine p-4 lg:flex">
          <Logo tone="paper" className="px-2 pt-1" />
          <Nav pathname={pathname} />
          {footer}
        </aside>
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-pine px-4 text-paper lg:hidden">
          <Logo tone="paper" />
          <button onClick={() => setOpen(true)} className="btn size-11 min-h-0 rounded-full p-0" aria-label="Abrir menú del panel" aria-expanded={open}>
            <Icon name="menu" />
          </button>
        </header>
        {open && (
          <div className="fixed inset-0 z-[70] flex flex-col gap-5 overflow-y-auto bg-pine p-4 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú del panel">
            <div className="flex items-center justify-between">
              <Logo tone="paper" />
              <button onClick={() => setOpen(false)} className="btn size-11 min-h-0 rounded-full p-0 text-paper" aria-label="Cerrar menú">
                <Icon name="close" />
              </button>
            </div>
            <Nav pathname={pathname} />
            {footer}
          </div>
        )}
        <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </div>
    </RequireAdmin>
  );
}
