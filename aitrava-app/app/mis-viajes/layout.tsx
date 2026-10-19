import type { Metadata } from 'next';

/** Sección privada: no se indexa. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
