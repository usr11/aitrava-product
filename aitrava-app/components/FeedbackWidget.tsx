'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { getAnonId } from '@/lib/track';
import { Icon } from './Icon';

const FACES = ['😣', '😕', '😐', '🙂', '🤩'];

/** Botón flotante de feedback en todas las pantallas (evidencia para las iteraciones). */
export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  if (pathname.startsWith('/admin')) return null;
  // En móvil no tapamos el botón fijo del wizard ni del pago.
  const crowded = pathname.startsWith('/crear') || pathname.endsWith('/pago');

  const submit = async () => {
    await api('/feedback', { json: { kind: 'widget', score: score ?? undefined, comment: comment || undefined, page: pathname, anonId: getAnonId() } }).catch(() => {});
    setSent(true);
    setTimeout(() => {
      setOpen(false);
      setSent(false);
      setScore(null);
      setComment('');
    }, 1800);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`fixed right-4 bottom-24 z-40 ${crowded ? 'hidden md:flex' : 'flex'} items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-text-soft shadow-lg shadow-black/40 transition hover:border-primary md:bottom-6`}
        aria-label="Danos tu opinión"
      >
        <Icon name="message" size={18} /> <span className="hidden sm:inline">¿Qué le cambiarías?</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div className="card animate-pop w-full max-w-md p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Feedback">
            {sent ? (
              <p className="py-8 text-center text-lg font-semibold">¡Gracias! Lo leemos todo 💛</p>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow text-secondary">Tu opinión cambia la app</p>
                    <h2 className="display mt-2 text-3xl">¿Qué tal vamos?</h2>
                  </div>
                  <button onClick={() => setOpen(false)} className="btn-ghost -mt-2 -mr-2 rounded-full p-2" aria-label="Cerrar">
                    <Icon name="close" />
                  </button>
                </div>
                <div className="mb-4 flex justify-between gap-2">
                  {FACES.map((f, i) => (
                    <button
                      key={f}
                      onClick={() => setScore(i + 1)}
                      className={`grid size-14 place-items-center rounded-2xl border text-2xl transition ${
                        score === i + 1 ? 'border-primary bg-primary/15 scale-110' : 'border-line-strong'
                      }`}
                      aria-label={`Calificación ${i + 1} de 5`}
                      aria-pressed={score === i + 1}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <textarea
                  className="input min-h-24 resize-none"
                  placeholder="¿Qué te confundió, qué te encantó o qué le agregarías?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button onClick={submit} disabled={!score && !comment} className="btn btn-primary mt-4 w-full">
                  Enviar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
