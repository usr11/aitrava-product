'use client';

import { AdminTitle, useAdminData } from '@/components/admin/common';
import { ErrorState, LoadingState } from '@/components/ui';
import { formatDate } from '@/lib/format';

type F = { id: string; kind: string; score: number | null; comment: string | null; page: string | null; createdAt: string };

export default function FeedbackPage() {
  const { data, error, reload } = useAdminData<F[]>('/admin/feedback');
  const scored = data?.filter((f) => f.score != null) ?? [];
  const avg = scored.length ? (scored.reduce((s, f) => s + (f.score ?? 0), 0) / scored.length).toFixed(1) : null;
  return (
    <>
      <AdminTitle title="Feedback" text={avg ? `Promedio del widget: ${avg} / 5 (${scored.length} respuestas)` : 'Opiniones del widget en todas las pantallas.'} />
      {error ? <ErrorState text={error} onRetry={reload} /> : !data ? <LoadingState label="Cargando…" /> : !data.length ? <p className="text-text-3">Sin datos suficientes.</p> : (
        <ul className="space-y-2">
          {data.map((f) => (
            <li key={f.id} className="card p-4 text-sm">
              <p className="text-text-2">{formatDate(f.createdAt, { day: 'numeric', month: 'short' })} · {f.page ?? '—'} {f.score != null && <strong className="text-navy">· {f.score}/5</strong>}</p>
              {f.comment && <p className="mt-1 text-navy">{f.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
