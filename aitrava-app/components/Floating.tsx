'use client';

import { usePathname } from 'next/navigation';
import { whatsappLink } from '@/lib/site';
import { track } from '@/lib/track';
import { Icon } from './Icon';

/** En el detalle de una salida hay barra fija de reserva: ahí el botón sube para no taparla. */
export function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname.startsWith('/reserva') || pathname.startsWith('/encuesta') || pathname.startsWith('/equipo')) return null;
  const raised = /^\/salidas\/[^/]+/.test(pathname);
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('whatsapp_clicked', { from: 'flotante', path: pathname })}
      className={`fixed right-4 z-40 grid size-14 place-items-center rounded-full bg-pine text-paper ring-2 ring-paper transition hover:bg-forest print:hidden ${raised ? 'bottom-[calc(var(--safe-bottom)+96px)] lg:bottom-6' : 'bottom-[calc(var(--safe-bottom)+16px)] lg:bottom-6'}`}
      aria-label="Escríbenos por WhatsApp"
    >
      <Icon name="whatsapp" size={28} strokeWidth={1.9} />
    </a>
  );
}
