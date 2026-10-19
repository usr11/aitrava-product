import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@/components/Analytics';
import { AppShell } from '@/components/AppShell';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: { default: 'AITRAVA | Tu viaje vive aquí', template: '%s | AITRAVA' },
  description:
    'Planea, ahorra, organiza y lleva contigo todo tu viaje en un solo lugar: itinerario, reservas, documentos, presupuesto y un plan de ahorro inteligente hasta el día del viaje.',
  icons: { icon: '/brand/favicon.png', apple: '/brand/apple-touch-icon.png' },
  openGraph: {
    title: 'AITRAVA | Tu viaje vive aquí',
    description: 'Planea, ahorra y lleva contigo todo tu viaje en un solo lugar.',
    images: ['/brand/og-image.jpg'],
    locale: 'es_CO',
    siteName: 'AITRAVA',
    type: 'website',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={jakarta.variable}>
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
