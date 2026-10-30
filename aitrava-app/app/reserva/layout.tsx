import type { Metadata } from 'next';

/** Página privada (enlace con token): no se indexa ni se comparte la URL con terceros. */
export const metadata: Metadata = {
  title: 'Tu reserva',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
