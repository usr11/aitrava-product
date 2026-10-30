'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { lockScroll } from '@/lib/scroll-lock';
import { Icon } from './Icon';
import { Logo } from './Logo';

const LINKS = [
  { href: '/salidas', label: 'Salidas' },
  { href: '/lugares', label: 'Lugares' },
  { href: '/seguridad', label: 'Seguridad' },
  { href: '/ayuda', label: 'Preguntas' },
  { href: '/anfitriones', label: 'Soy anfitrión' },
];

const isActive = (pathname: string, href: string) => pathname.startsWith(href);

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => (open ? lockScroll() : undefined), [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/95 pt-[var(--safe-top)] backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(pathname, l.href) ? 'page' : undefined}
              className={`rounded-full px-3.5 py-2 font-semibold transition-colors hover:bg-paper-2 ${isActive(pathname, l.href) ? 'text-pine underline decoration-ember decoration-[3px] underline-offset-[10px]' : 'text-ink-2'}`}
            >
              {l.label}
            </Link>
          ))}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="ml-1 rounded-full px-3.5 py-2 font-semibold text-forest hover:bg-paper-2">
              Panel
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/salidas" className="btn btn-ember btn-sm hidden sm:inline-flex">
            Ver salidas
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="btn size-11 min-h-0 rounded-full p-0 hover:bg-paper-2 lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="menu-movil"
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] bg-pine text-paper [animation:fade-in_.15s_ease] lg:hidden" id="menu-movil" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="wrap flex h-16 items-center justify-between pt-[var(--safe-top)]">
            <Logo tone="paper" />
            <button onClick={() => setOpen(false)} className="btn size-11 min-h-0 rounded-full p-0 hover:bg-pine-2" aria-label="Cerrar menú">
              <Icon name="close" />
            </button>
          </div>
          <nav aria-label="Menú móvil" className="wrap mt-6 flex flex-col">
            {[{ href: '/', label: 'Inicio' }, ...LINKS, { href: '/nosotros', label: 'Nosotros' }].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`display border-b border-pine-3 py-4 text-[2rem] ${pathname === l.href ? 'text-ember' : 'text-paper'}`}
              >
                {l.label}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className="display border-b border-pine-3 py-4 text-[2rem] text-on-pine-2">
                Panel del equipo
              </Link>
            )}
          </nav>
          <div className="wrap absolute inset-x-0 bottom-[calc(var(--safe-bottom)+20px)]">
            <Link href="/salidas" className="btn btn-ember btn-block">
              Ver las próximas salidas
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
