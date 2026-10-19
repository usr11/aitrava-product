'use client';

import { AdminTitle, ExportButton, useAdminData } from '@/components/admin/common';
import { DemoBadge, ErrorState, LoadingState, Tone } from '@/components/ui';
import { formatCOP, formatRange } from '@/lib/format';

type T = {
  id: string; title: string; mode: string; destination: string; startDate: string; endDate: string; travelerCount: number; budgetAmount: number; isDemo: boolean;
  user: { email: string }; pass: string; savingsProgress: number | null; counts: { bookings: number; documents: number; items: number; expenses: number };
};
const MODE: Record<string, string> = { KNOWN: 'Sé a dónde voy', HELP: 'Ayúdame a elegir', SURPRISE: 'Sorpresa' };

export default function ViajesAdmin() {
  const { data, error, reload } = useAdminData<T[]>('/admin/trips');
  return (
    <>
      <AdminTitle title="Viajes" action={<ExportButton entity="viajes" />} />
      {error ? <ErrorState text={error} onRetry={reload} /> : !data ? <LoadingState label="Cargando…" /> : !data.length ? <p className="text-text-3">Sin datos suficientes.</p> : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {data.map((t) => (
            <li key={t.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-navy">{t.title} {t.isDemo && <DemoBadge />}</p>
                  <p className="text-sm text-text-2">{t.destination} · {formatRange(t.startDate, t.endDate)} · {t.travelerCount} pax</p>
                  <p className="truncate text-xs text-text-3">{t.user.email}</p>
                </div>
                {t.pass === 'active' ? <Tone tone="ok">Pass</Tone> : t.pass === 'demo' ? <Tone tone="muted">Demo</Tone> : <Tone tone="muted">Free</Tone>}
              </div>
              <p className="mt-2 text-xs text-text-2">
                {MODE[t.mode]} · {formatCOP(t.budgetAmount)} · ahorro {t.savingsProgress == null ? '—' : `${t.savingsProgress} %`} · {t.counts.bookings} reservas · {t.counts.documents} docs · {t.counts.items} actividades
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
