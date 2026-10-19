'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { lockScroll } from '@/lib/scroll-lock';
import { Icon, type IconName } from './Icon';
import { Logo } from './Logo';

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/destinos', label: 'Destinos' },
  { href: '/planear', label: 'Planear viaje' },
  { href: '/mis-viajes', label: 'Mis viajes' },
  { href: '/proveedores', label: 'Proveedores' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/ayuda', label: 'Ayuda' },
];

const isActive = (pathname: string, href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid size-10 place-items-center rounded-full bg-navy text-sm font-bold text-white" aria-hidden>
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDrawer(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menu]);

  useEffect(() => (drawer ? lockScroll() : undefined), [drawer]);

  const logout = () => {
    signOut();
    router.push('/');
  };

  const accountLinks: { href: string; label: string; icon: IconName }[] = [
    { href: '/mis-viajes', label: 'Mis viajes', icon: 'calendar' },
    { href: '/mi-cuenta', label: 'Mi cuenta', icon: 'user' },
    ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'Panel admin', icon: 'chart' as IconName }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="container-app flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link href="/" aria-label="AITRAVA, inicio" className="shrink-0">
          <Logo size={36} />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Principal">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(pathname, l.href) ? 'page' : undefined}
              className={`rounded-full px-3.5 py-2 text-[0.9rem] font-semibold transition ${
                isActive(pathname, l.href) ? 'bg-sky text-navy' : 'text-text-2 hover:text-navy'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && !user && (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/iniciar-sesion" className="btn btn-ghost btn-sm">
                Iniciar sesión
              </Link>
              <Link href="/registro" className="btn btn-navy btn-sm">
                Crear cuenta
              </Link>
            </div>
          )}
          {user && (
            <div className="relative hidden lg:block" ref={menuRef}>
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-surface"
                aria-haspopup="menu"
                aria-expanded={menu}
              >
                <Avatar name={user.firstName} />
                <span className="text-sm font-semibold text-navy">{user.firstName}</span>
                <Icon name="chevronDown" size={16} className="text-text-2" />
              </button>
              {menu && (
                <div role="menu" className="card animate-fade-up absolute right-0 mt-2 w-56 p-2">
                  {accountLinks.map((l) => (
                    <Link key={l.href} href={l.href} role="menuitem" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy hover:bg-surface">
                      <Icon name={l.icon} size={18} className="text-text-2" /> {l.label}
                    </Link>
                  ))}
                  <button onClick={logout} role="menuitem" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-bad hover:bg-bad-bg">
                    <Icon name="logout" size={18} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setDrawer(true)}
            className="btn btn-ghost size-11 rounded-full p-0 lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={drawer}
          >
            {user ? <Avatar name={user.firstName} /> : <Icon name="menu" size={24} />}
          </button>
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[70] bg-navy/40 lg:hidden" onClick={() => setDrawer(false)}>
          <aside
            className="animate-fade-up ml-auto flex h-dvh w-[86%] max-w-sm flex-col overflow-y-auto bg-white p-5"
            style={{ paddingTop: 'calc(20px + var(--safe-top))', paddingBottom: 'calc(20px + var(--safe-bottom))' }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Menú"
          >
            <div className="flex items-center justify-between">
              <Logo size={32} />
              <button onClick={() => setDrawer(false)} className="btn btn-ghost size-11 rounded-full p-0" aria-label="Cerrar menú">
                <Icon name="close" />
              </button>
            </div>
            {user && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-surface p-3">
                <Avatar name={user.firstName} />
                <div className="min-w-0">
                  <p className="truncate font-bold text-navy">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-sm text-text-2">{user.email}</p>
                </div>
              </div>
            )}
            <nav className="mt-4 flex flex-col" aria-label="Menú principal">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(pathname, l.href) ? 'page' : undefined}
                  className={`rounded-xl px-3 py-3.5 font-semibold ${isActive(pathname, l.href) ? 'bg-sky text-navy' : 'text-navy'}`}
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/contacto" className="rounded-xl px-3 py-3.5 font-semibold text-navy">
                Contacto
              </Link>
            </nav>
            <div className="mt-auto space-y-2 pt-6">
              {user ? (
                <>
                  {accountLinks.slice(1).map((l) => (
                    <Link key={l.href} href={l.href} className="btn btn-outline w-full">
                      <Icon name={l.icon} size={18} /> {l.label}
                    </Link>
                  ))}
                  <button onClick={logout} className="btn btn-danger w-full">
                    <Icon name="logout" size={18} /> Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/registro" className="btn btn-navy w-full">
                    Crear cuenta
                  </Link>
                  <Link href="/iniciar-sesion" className="btn btn-outline w-full">
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
