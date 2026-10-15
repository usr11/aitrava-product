'use client';

import { usePathname } from 'next/navigation';
import { WHATSAPP_URL } from '@/lib/constants';
import { track } from '@/lib/track';

function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2zm0 1.8c2.16 0 4.2.84 5.73 2.37a8.06 8.06 0 0 1 2.37 5.73c0 4.47-3.63 8.1-8.1 8.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.06.8.82-2.99-.19-.31a8.06 8.06 0 0 1-1.24-4.3c0-4.46 3.64-8.09 8.1-8.09zm-3.7 4.3c-.17 0-.45.07-.69.33-.24.26-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.18 1.8 2.75 4.37 3.85.61.26 1.09.42 1.46.54.61.2 1.17.17 1.61.1.49-.07 1.5-.61 1.72-1.21.21-.6.21-1.11.15-1.21-.07-.11-.24-.17-.5-.3-.26-.13-1.5-.74-1.74-.83-.23-.08-.4-.13-.57.14-.17.26-.65.82-.8 1-.14.17-.29.19-.55.06-.26-.13-1.08-.4-2.06-1.27-.76-.68-1.28-1.52-1.42-1.78-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.44.09-.17.04-.33-.02-.46-.07-.13-.57-1.38-.79-1.89-.2-.49-.4-.42-.55-.43h-.47z" />
    </svg>
  );
}

/** Botón flotante del asesor de ventas (en todas las pantallas menos admin). */
export function WhatsAppFloating() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('whatsapp_click', { where: 'flotante', path: pathname })}
      className="fixed right-4 bottom-24 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-bold text-[#06310f] shadow-lg shadow-black/40 transition hover:scale-105 md:bottom-6"
      aria-label="Hablar con un asesor por WhatsApp"
    >
      <span className="relative flex">
        <WhatsAppIcon size={24} />
        <span className="absolute -top-1 -right-1 size-2.5 animate-pulse rounded-full bg-white" aria-hidden />
      </span>
      <span className="hidden text-sm sm:inline">Asesor en línea</span>
    </a>
  );
}

/** Tarjeta destacada para meter dentro de una pantalla (pago, viaje, inicio). */
export function WhatsAppCard({ where, title, text }: { where: string; title: string; text: string }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('whatsapp_click', { where })}
      className="flex items-center gap-4 rounded-3xl border border-[#25D366]/40 bg-[#25D366]/10 p-5 transition hover:border-[#25D366] hover:bg-[#25D366]/15"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#25D366] text-[#06310f]">
        <WhatsAppIcon size={26} />
      </span>
      <span className="flex-1">
        <span className="block font-bold">{title}</span>
        <span className="block text-sm text-muted">{text}</span>
      </span>
      <span className="eyebrow shrink-0 rounded-full bg-[#25D366] px-3 py-1.5 text-[10px] text-[#06310f]">Chatear</span>
    </a>
  );
}
