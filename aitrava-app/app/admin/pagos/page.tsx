'use client';

import { useState } from 'react';
import { AdminTitle, ExportButton, useAdminData } from '@/components/admin/common';
import { Alert, DemoBadge, ErrorState, Field, LoadingState, Sheet, Tone } from '@/components/ui';
import { api } from '@/lib/api';
import { PAYMENT_STATUS } from '@/lib/catalog';
import { formatCOP, formatDate, formatTime } from '@/lib/format';
import type { PaymentStatus } from '@/lib/types';

type P = {
  id: string; reference: string; amount: number; status: PaymentStatus; userNote: string | null; providerTxId: string | null; verifiedVia: string | null; createdAt: string;
  user: { email: string; firstName: string; lastName: string; isDemo: boolean }; trip: { title: string; isDemo: boolean };
};
const OPEN: PaymentStatus[] = ['created', 'redirected', 'pending', 'pending_verification', 'unknown'];

export default function PagosAdmin() {
  const { data, error, reload } = useAdminData<P[]>('/admin/payments');
  const [filter, setFilter] = useState<'todos' | 'verificar' | 'approved'>('verificar');
  const [verify, setVerify] = useState<P | null>(null);
  const [tx, setTx] = useState('');
  const [err, setErr] = useState('');

  const decide = async (status: 'approved' | 'declined') => {
    setErr('');
    try {
      await api(`/admin/payments/${verify!.id}/verify`, { json: { status, providerTxId: tx || undefined } });
      setVerify(null);
      setTx('');
      reload();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const list = data?.filter((p) => (filter === 'todos' ? true : filter === 'approved' ? p.status === 'approved' : OPEN.includes(p.status)));
  return (
    <>
      <AdminTitle title="Pagos" text="Aprueba un pago solo después de verlo APROBADO en el panel de Wompi. Volver a la app no es prueba de pago." action={<ExportButton entity="pagos" />} />
      <div className="mb-4 flex flex-wrap gap-2">
        {([['verificar', 'Por verificar'], ['approved', 'Aprobados'], ['todos', 'Todos']] as const).map(([k, l]) => (
          <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      {error ? <ErrorState text={error} onRetry={reload} /> : !list ? <LoadingState label="Cargando…" /> : !list.length ? <p className="text-text-3">Sin pagos en esta vista.</p> : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {list.map((p) => (
            <li key={p.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono font-bold text-navy">{p.reference}</p>
                <Tone tone={PAYMENT_STATUS[p.status].tone}>{PAYMENT_STATUS[p.status].label}</Tone>
              </div>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-text-2">Usuario</dt><dd className="truncate text-navy">{p.user.email} {(p.user.isDemo || p.trip.isDemo) && <DemoBadge />}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-text-2">Valor</dt><dd className="num font-semibold text-navy">{formatCOP(p.amount)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-text-2">Viaje</dt><dd className="truncate text-navy">{p.trip.title}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-text-2">Fecha</dt><dd className="text-navy">{formatDate(p.createdAt, { day: 'numeric', month: 'short' })} {formatTime(p.createdAt)} UTC</dd></div>
                {p.userNote && <div className="flex justify-between gap-3"><dt className="text-text-2">Nota del usuario</dt><dd className="truncate text-navy">{p.userNote}</dd></div>}
                {p.verifiedVia && <div className="flex justify-between gap-3"><dt className="text-text-2">Verificado por</dt><dd className="text-navy">{p.verifiedVia}</dd></div>}
              </dl>
              {OPEN.includes(p.status) && (
                <button onClick={() => (setVerify(p), setTx(p.userNote ?? ''))} className="btn btn-navy btn-sm mt-3 w-full">Verificar</button>
              )}
            </li>
          ))}
        </ul>
      )}
      <Sheet open={!!verify} onClose={() => setVerify(null)} title={`Verificar ${verify?.reference ?? ''}`}>
        <Alert tone="warn">Busca la transacción en el panel de Wompi (valor {verify && formatCOP(verify.amount)}, correo {verify?.user.email}). Aprueba solo si allá figura como APROBADA.</Alert>
        <div className="mt-4">
          <Field label="ID de la transacción en Wompi" htmlFor="tx"><input id="tx" className="input" value={tx} onChange={(e) => setTx(e.target.value)} /></Field>
        </div>
        {err && <div className="mt-3"><Alert tone="bad">{err}</Alert></div>}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={() => decide('declined')} className="btn btn-danger">Rechazar</button>
          <button onClick={() => decide('approved')} className="btn btn-navy">Aprobar y activar Pass</button>
        </div>
      </Sheet>
    </>
  );
}
