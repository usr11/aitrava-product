'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';
import { captureAttribution, track } from '@/lib/track';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** Meta Pixel + page_view propio en cada cambio de ruta (y landing_view en el inicio). */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    // No se mide el panel admin (son visitas del equipo)
    if (pathname.startsWith('/admin')) return;
    track('page_view', { path: pathname.replace(/\/viajes\/[^/]+/, '/viajes/:id').replace(/\/(checkout|comprobante)\/[^/]+/, '/$1/:id') });
    if (pathname === '/') track('landing_view');
  }, [pathname]);

  if (!PIXEL_ID) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
    </Script>
  );
}
