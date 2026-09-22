'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RequireAuth } from '@/components/RequireAuth';

const TABS = [
  { href: '/admin', label: 'Métricas' },
  { href: '/admin/iteraciones', label: 'Iteraciones' },
  { href: '/admin/feedback', label: 'Feedback' },
  { href: '/admin/usuarios', label: 'Usuarios' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <RequireAuth admin>
      <div className="container-app py-6 md:py-10">
        <p className="eyebrow text-secondary">Panel del equipo</p>
        <h1 className="display mt-2 text-5xl sm:text-6xl">Evidencia en vivo</h1>
        <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Secciones admin">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className="chip shrink-0" aria-pressed={pathname === t.href}>
              {t.label}
            </Link>
          ))}
          <Link href="/" className="chip shrink-0 text-muted-2">← Volver a la app</Link>
        </nav>
        <div className="mt-8">{children}</div>
      </div>
    </RequireAuth>
  );
}
