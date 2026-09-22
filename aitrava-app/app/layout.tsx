import type { Metadata, Viewport } from 'next';
import { Big_Shoulders, Familjen_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import { Analytics } from '@/components/Analytics';
import { AppShell } from '@/components/AppShell';
import { DemoBanner } from '@/components/DemoBanner';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

const display = Big_Shoulders({ subsets: ['latin'], weight: ['800', '900'], variable: '--font-big-shoulders' });
const body = Familjen_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-familjen' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-plex-mono' });

export const metadata: Metadata = {
  title: 'AiTrava · Viajes sorpresa personalizados',
  description:
    'Tú pones el presupuesto y las fechas; nuestra IA arma transporte, alojamiento y planes locales. El destino lo descubres cuando toca.',
  icons: { icon: '/brand/favicon.png', apple: '/brand/apple-touch-icon.png' },
  openGraph: { images: ['/brand/og-image.jpg'], locale: 'es_CO', siteName: 'AiTrava' },
};

export const viewport: Viewport = { themeColor: '#1A1C20', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <AuthProvider>
          <DemoBanner />
          <AppShell>{children}</AppShell>
          <FeedbackWidget />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
