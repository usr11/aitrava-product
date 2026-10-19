'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { FeedbackWidget, WhatsAppFloatingButton } from './Floating';
import { Footer } from './Footer';
import { MobileNavbar, hideBottomNav } from './MobileNavbar';
import { Navbar } from './Navbar';

/** Header + contenido + footer + barra inferior y botones flotantes. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = pathname.startsWith('/admin');
  const travelMode = pathname.includes('/modo-viaje');
  const withBottomNav = !!user && !hideBottomNav(pathname);
  const showFooter = !isAdmin && !travelMode && !pathname.startsWith('/planear') && !pathname.startsWith('/checkout');

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-white">
        Saltar al contenido
      </a>
      {!isAdmin && <Navbar />}
      <main id="contenido" className={`flex-1 ${withBottomNav ? 'pb-[calc(var(--bottom-nav)+var(--safe-bottom))] lg:pb-0' : ''}`}>
        {children}
      </main>
      {showFooter && (
        <div className={withBottomNav ? 'pb-[calc(var(--bottom-nav)+var(--safe-bottom))] lg:pb-0' : ''}>
          <Footer />
        </div>
      )}
      <MobileNavbar />
      <WhatsAppFloatingButton />
      <FeedbackWidget />
    </div>
  );
}
