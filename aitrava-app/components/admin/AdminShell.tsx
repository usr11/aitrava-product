'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RequireAuth } from '../RequireAuth';
import { Icon, type IconName } from '../Icon';
import { Logo } from '../Logo';

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin', label: 'Dashboard', icon: 'chart' },
  { href: '/admin/usuarios', label: 'Usuarios', icon: 'users' },
  { href: '/admin/viajes', label: 'Viajes', icon: 'plane' },
  { href: '/admin/pagos', label: 'Pagos', icon: 'card' },
  { href: '/admin/finanzas', label: 'Finanzas', icon: 'wallet' },
  { href: '/admin/analytics', label: 'Analítica', icon: 'trendingUp' },
  { href: '/admin/proveedores', label: 'Proveedores', icon: 'globe' },
  { href: '/admin/mensajes', label: 'Mensajes', icon: 'mail' },
  { href: '/admin/feedback', label: 'Feedback', icon: 'message' },
  { href: '/admin/iteraciones', label: 'Iteraciones', icon: 'refresh' },
  { href: '/admin/configuracion', label: 'Configuración', icon: 'settings' },
];

function Links({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Panel admin">
      {NAV.map((n) => {
        const active = n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${active ? 'bg-yellow text-navy' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
          >
            <Icon name={n.icon} size={18} /> {n.label}
          </Link>
        );
      })}
      <Link href="/" className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:text-white">
        <Icon name="back" size={18} /> Volver a la app
      </Link>
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const current = NAV.find((n) => (n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href)));
  return (
    <RequireAuth admin>
      <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[248px_1fr]">
        <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto bg-navy p-5 lg:flex">
          <Logo size={34} light />
          <p className="mt-1 mb-6 text-xs text-white/60">Panel del equipo</p>
          <Links pathname={pathname} />
        </aside>
        <header className="sticky top-0 z-40 flex items-center gap-3 bg-navy px-4 py-3 text-white lg:hidden" style={{ paddingTop: 'calc(12px + var(--safe-top))' }}>
          <button onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-xl hover:bg-white/10" aria-label="Abrir menú admin">
            <Icon name="menu" />
          </button>
          <p className="font-bold">{current?.label ?? 'Admin'}</p>
        </header>
        {open && (
          <div className="fixed inset-0 z-50 bg-navy/50 lg:hidden" onClick={() => setOpen(false)}>
            <aside className="h-dvh w-72 overflow-y-auto bg-navy p-5" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <Logo size={32} light />
                <button onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-xl text-white" aria-label="Cerrar menú">
                  <Icon name="close" />
                </button>
              </div>
              <Links pathname={pathname} />
            </aside>
          </div>
        )}
        <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </div>
    </RequireAuth>
  );
}
