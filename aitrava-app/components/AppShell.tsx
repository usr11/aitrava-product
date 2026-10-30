'use client';

import { usePathname } from 'next/navigation';
import { WhatsAppButton } from './Floating';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

/** Encabezado + contenido + footer. El panel del equipo (/admin) trae su propio marco. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-pine focus:px-4 focus:py-2 focus:text-paper"
      >
        Saltar al contenido
      </a>
      {!isAdmin && <Navbar />}
      <main id="contenido" className="flex-1">
        {children}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton />}
    </div>
  );
}
