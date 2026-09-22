'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

/** Encuesta NPS tras la revelación (métrica clave para la rúbrica). */
export function NpsForm({ tripId }: { tripId: string }) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  if (sent) return <p className="card p-6 text-center font-semibold">¡Gracias! Con esto mejoramos el próximo viaje 💛</p>;

  return (
    <div className="card p-5 sm:p-6">
      <p className="eyebrow text-secondary">Una pregunta rápida</p>
      <h3 className="mt-2 text-xl font-bold">¿Qué tan probable es que recomiendes AiTrava a un amigo?</h3>
      <div className="mt-4 grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            onClick={() => setScore(n)}
            aria-pressed={score === n}
            className={`aspect-square rounded-lg border text-sm font-bold transition ${
              score === n ? 'border-primary bg-primary text-ink' : 'border-line-strong hover:border-muted-2'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-dim">
        <span>Nada probable</span>
        <span>Muy probable</span>
      </div>
      {score !== null && (
        <>
          <label className="mt-5 block">
            <span className="field-label">{score >= 9 ? '¿Qué fue lo que más te gustó?' : '¿Qué tendríamos que mejorar?'}</span>
            <textarea className="input min-h-20 resize-none" value={comment} onChange={(e) => setComment(e.target.value)} />
          </label>
          <button
            className="btn btn-primary mt-4 w-full"
            onClick={async () => {
              await api('/feedback', { json: { kind: 'nps', score, comment: comment || undefined, tripId, page: 'revelacion' } }).catch(() => {});
              setSent(true);
            }}
          >
            Enviar
          </button>
        </>
      )}
    </div>
  );
}
