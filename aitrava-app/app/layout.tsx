import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@/components/Analytics';
import { AppShell } from '@/components/AppShell';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

// Archivo variable (ejes de peso y ancho), incluida en el repo: el build de Cloudflare no siempre llega a Google Fonts.
const archivo = localFont({
  src: './fonts/Archivo-latin-wdth.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-archivo',
  declarations: [{ prop: 'font-stretch', value: '62% 125%' }],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: { default: 'AiTrava · Ve solo, sal acompañado', template: '%s · AiTrava' },
  description:
    'Salidas en grupos pequeños a la naturaleza y la cultura de Cali. Llegas solo, te armamos el grupo con un anfitrión local y sales con gente nueva.',
  openGraph: {
    title: 'AiTrava · Ve solo, sal acompañado',
    description: 'Salidas de 6 a 10 personas a la naturaleza y la cultura de Cali. Tú solo tienes que llegar.',
    locale: 'es_CO',
    siteName: 'AiTrava',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#04261e',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={archivo.variable}>
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
