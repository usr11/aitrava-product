'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/Spinner';
import { api } from '@/lib/api';

type Feedback = { id: string; kind: string; score: number | null; comment: string | null; page: string | null; createdAt: string };
const FACES = ['', '😣', '😕', '😐', '🙂', '🤩'];

export default function AdminFeedback() {
  const [items, setItems] = useState<Feedback[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'nps' | 'widget'>('all');
  useEffect(() => {
    api<Feedback[]>('/admin/feedback').then(setItems).catch(() => setItems([]));
  }, []);
  if (!items) return <Spinner full />;
  const shown = items.filter((f) => filter === 'all' || f.kind === filter);

  return (
    <div>
      <div className="flex gap-2">
        {(['all', 'nps', 'widget'] as const).map((f) => (
          <button key={f} className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Todo' : f === 'nps' ? 'NPS' : 'Widget'}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="card mt-6 p-8 text-center text-muted">Aún no hay feedback. Comparte la app y pide a la gente que use el botón “¿Qué le cambiarías?”.</p>
      ) : (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {shown.map((f) => (
            <li key={f.id} className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="eyebrow text-[10px] text-muted-2">
                  {f.kind === 'nps' ? 'NPS' : 'Widget'} · {f.page ?? '—'}
                </span>
                <span className="font-mono text-xs text-dim">{new Date(f.createdAt).toLocaleString('es-CO')}</span>
              </div>
              <p className="mt-2 text-2xl">
                {f.kind === 'nps' ? (
                  <span className={`font-display font-black ${f.score! >= 9 ? 'text-ok' : f.score! <= 6 ? 'text-bad' : 'text-secondary'}`}>{f.score}/10</span>
                ) : (
                  FACES[f.score ?? 0]
                )}
              </p>
              {f.comment && <p className="mt-2 text-text-soft">“{f.comment}”</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
