'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { whatsappLink } from '@/lib/site';
import { getAnonId, track } from '@/lib/track';
import { Icon } from './Icon';
import { hideBottomNav } from './MobileNavbar';
import { Sheet } from './ui';

/** Rutas donde un botón flotante estorbaría (Modo Viaje, wizard, checkout, admin). */
const crowded = (p: string) =>
  p.startsWith('/admin') || p.includes('/modo-viaje') || p.startsWith('/planear') || p.startsWith('/checkout') || p.startsWith('/comprobante');

/** Distancia al borde inferior: encima de la barra inferior cuando existe (móvil). */
function useBottomOffset() {
  const pathname = usePathname();
  const { user } = useAuth();
  const withNav = !!user && !hideBottomNav(pathname);
  return withNav ? 'bottom-[calc(var(--bottom-nav)+var(--safe-bottom)+14px)] lg:bottom-6' : 'bottom-[calc(var(--safe-bottom)+16px)] lg:bottom-6';
}

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const bottom = useBottomOffset();
  if (crowded(pathname)) return null;
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('whatsapp_click', { path: pathname })}
      className={`fixed right-4 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-lift)] transition hover:scale-105 print:hidden ${bottom}`}
      aria-label="Escríbenos por WhatsApp"
    >
      <Icon name="whatsapp" size={28} strokeWidth={1.9} />
    </a>
  );
}

const FACES = ['😣', '😕', '😐', '🙂', '🤩'];

/** Feedback en todas las pantallas (evidencia para las iteraciones). */
export function FeedbackWidget() {
  const pathname = usePathname();
  const bottom = useBottomOffset();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  if (crowded(pathname)) return null;

  const submit = async () => {
    await api('/feedback', {
      json: { kind: 'widget', score: score ?? undefined, comment: comment || undefined, page: pathname, anonId: getAnonId() },
    }).catch(() => {});
    setSent(true);
    setTimeout(() => {
      setOpen(false);
      setSent(false);
      setScore(null);
      setComment('');
    }, 1600);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`fixed left-4 z-40 flex h-11 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-sm font-semibold text-navy shadow-[var(--shadow-soft)] transition hover:border-line-2 print:hidden ${bottom}`}
        aria-label="Danos tu opinión"
      >
        <Icon name="message" size={18} /> <span className="hidden sm:inline">Tu opinión</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="¿Cómo te va con AITRAVA?">
        {sent ? (
          <p className="py-8 text-center text-lg font-semibold text-navy">¡Gracias! Lo leemos todo.</p>
        ) : (
          <>
            <p className="text-sm text-text-2">Tu opinión nos ayuda a mejorar el producto.</p>
            <div className="mt-4 flex justify-between gap-2">
              {FACES.map((f, i) => (
                <button
                  key={f}
                  onClick={() => setScore(i + 1)}
                  className={`grid size-14 place-items-center rounded-2xl border-2 text-2xl transition ${
                    score === i + 1 ? 'scale-105 border-yellow bg-yellow-soft' : 'border-line'
                  }`}
                  aria-label={`Calificación ${i + 1} de 5`}
                  aria-pressed={score === i + 1}
                >
                  {f}
                </button>
              ))}
            </div>
            <label className="label mt-4" htmlFor="fb-comment">
              ¿Qué te confundió o qué le agregarías?
            </label>
            <textarea id="fb-comment" className="input min-h-24 resize-none" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
            <button onClick={submit} disabled={!score && !comment} className="btn btn-navy mt-4 w-full">
              Enviar
            </button>
          </>
        )}
      </Sheet>
    </>
  );
}
