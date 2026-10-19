'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { RequireAuth } from '@/components/RequireAuth';
import { Alert, BackLink, ErrorState, LoadingState } from '@/components/ui';
import { api, apiBlob, saveBlob } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatCOP, formatDate } from '@/lib/format';
import type { Payment } from '@/lib/types';

export default function ComprobantePage() {
  return (
    <RequireAuth verified={false}>
      <Receipt />
    </RequireAuth>
  );
}

function Receipt() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const { user } = useAuth();
  const [p, setP] = useState<Payment | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Payment>(`/payments/${paymentId}`).then(setP).catch((e: Error) => setError(e.message));
  }, [paymentId]);

  const download = async () => {
    setBusy(true);
    try {
      saveBlob(await apiBlob(`/payments/${paymentId}/receipt.pdf`), `comprobante-${p!.reference}.pdf`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (error) return <div className="container-app max-w-lg py-10"><ErrorState text={error} /></div>;
  if (!p) return <div className="container-app max-w-lg py-10"><LoadingState label="Cargando comprobante…" /></div>;
  if (p.status !== 'approved') {
    return (
      <div className="container-app max-w-lg py-10">
        <Alert tone="warn">El comprobante solo está disponible cuando el pago está aprobado. Estado actual: {p.status}.</Alert>
        <Link href={`/pago/resultado?ref=${p.id}`} className="btn btn-outline mt-4">Ver estado del pago</Link>
      </div>
    );
  }
  return (
    <div className="bg-surface">
      <div className="container-app max-w-lg py-6 pb-12">
        <BackLink href="/mi-cuenta" label="Mi cuenta" />
        <article className="card mt-3 p-6 sm:p-8">
          <Logo size={40} />
          <h1 className="mt-6 text-2xl font-extrabold text-navy">Comprobante de pago</h1>
          <span className="badge mt-2 bg-ok-bg text-ok">Aprobado</span>
          <dl className="mt-6 divide-y divide-line text-sm">
            {[
              ['Referencia', p.reference],
              ['Fecha', formatDate(p.verifiedAt ?? p.updatedAt, { day: 'numeric', month: 'long', year: 'numeric' })],
              ['Usuario', `${user?.firstName} ${user?.lastName}`],
              ['Correo', user?.email ?? ''],
              ['Producto', 'AITRAVA Pass'],
              ['Viaje asociado', p.trip?.title ?? ''],
              ['Valor', `${formatCOP(p.amount)} COP`],
              ['Estado', 'APROBADO'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-3">
                <dt className="text-text-2">{k}</dt>
                <dd className="text-right font-semibold break-all text-navy">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-xs text-text-2">
            Este comprobante corresponde exclusivamente al AITRAVA Pass y no representa el pago de vuelos, hoteles u otros servicios turísticos. No es una factura
            electrónica.
          </p>
          <button onClick={download} disabled={busy} className="btn btn-navy mt-6 w-full">
            <Icon name="download" size={18} /> {busy ? 'Generando…' : 'Descargar comprobante PDF'}
          </button>
        </article>
      </div>
    </div>
  );
}
