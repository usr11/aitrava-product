'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import { RequireAuth } from '@/components/RequireAuth';
import { Alert, ErrorState, Field, LoadingState } from '@/components/ui';
import { api } from '@/lib/api';
import { formatCOP, formatDate } from '@/lib/format';
import { CONTACT, whatsappLink } from '@/lib/site';
import { invalidateTrips } from '@/lib/trips';
import type { Payment } from '@/lib/types';

export function PaymentResult() {
  return (
    <RequireAuth verified={false}>
      <ResultView />
    </RequireAuth>
  );
}

function Shell({ icon, tone, title, text, children }: { icon: IconName; tone: string; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="container-app flex min-h-[70dvh] max-w-lg flex-col justify-center py-10">
      <div className="card p-6 text-center sm:p-8">
        <span className={`mx-auto grid size-16 place-items-center rounded-3xl ${tone}`}>
          <Icon name={icon} size={32} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-navy">{title}</h1>
        {text && <p className="mt-2 text-text-2">{text}</p>}
        <div className="mt-6 text-left">{children}</div>
      </div>
    </div>
  );
}

function ResultView() {
  const params = useSearchParams();
  const ref = params.get('ref');
  const wompiTx = params.get('id');
  const [p, setP] = useState<Payment | null>(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState(wompiTx ?? '');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!ref) return;
    api<Payment>(`/payments/${ref}`)
      .then((x) => {
        setP(x);
        if (x.status === 'approved') invalidateTrips();
      })
      .catch((e: Error) => setError(e.message));
  }, [ref]);
  useEffect(load, [load]);

  // Mientras está en verificación, se consulta cada 15 s.
  useEffect(() => {
    if (!p || !['pending', 'pending_verification'].includes(p.status)) return;
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, [p, load]);

  const report = async (result: 'paid' | 'cancelled' | 'failed') => {
    setBusy(true);
    try {
      setP(await api<Payment>(`/payments/${ref}/return`, { json: { result, note: note || undefined } }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!ref) return <Shell icon="alert" tone="bg-surface text-text-2" title="Pago desconocido" text="No encontramos la referencia de tu pago." />;
  if (error)
    return (
      <div className="container-app max-w-lg py-10">
        <ErrorState text={error} onRetry={load} />
      </div>
    );
  if (!p)
    return (
      <div className="container-app max-w-lg py-10">
        <LoadingState label="Consultando tu pago…" />
      </div>
    );

  const tripHref = `/viajes/${p.tripId}`;
  const retry = `/checkout/${p.tripId}`;

  if (p.status === 'approved') {
    return (
      <Shell icon="checkCircle" tone="bg-ok-bg text-ok" title="¡Pago confirmado!" text="Tu AITRAVA Pass está activo.">
        <dl className="divide-y divide-line rounded-2xl bg-surface px-4 text-sm">
          {[
            ['Referencia', p.reference],
            ['Fecha', formatDate(p.verifiedAt ?? p.updatedAt, { day: 'numeric', month: 'long', year: 'numeric' })],
            ['Valor', `${formatCOP(p.amount)} COP`],
            ['Viaje', p.trip?.title ?? ''],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 py-3">
              <dt className="text-text-2">{k}</dt>
              <dd className="text-right font-semibold text-navy">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 grid gap-3">
          <Link href={tripHref} className="btn btn-primary btn-lg">
            Ir a Mi Viaje
          </Link>
          <Link href={`/comprobante/${p.id}`} className="btn btn-outline">
            <Icon name="download" size={18} /> Descargar comprobante PDF
          </Link>
        </div>
      </Shell>
    );
  }

  if (p.status === 'pending' || p.status === 'pending_verification') {
    return (
      <Shell icon="clock" tone="bg-warn-bg text-warn" title="Estamos verificando tu pago." text="Tu Pass se activa en cuanto confirmemos el pago con Wompi. Esta página se actualiza sola.">
        <Alert tone="info">
          Si ya pasó un buen rato, escríbenos por{' '}
          <a className="font-semibold underline" href={whatsappLink(`Hola, pagué el AITRAVA Pass (referencia ${p.reference}) y está en verificación.`)} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>{' '}
          con tu referencia <strong>{p.reference}</strong>.
        </Alert>
        <Link href={tripHref} className="btn btn-outline mt-5 w-full">
          Volver a Mi Viaje
        </Link>
      </Shell>
    );
  }

  if (p.status === 'declined' || p.status === 'error') {
    return (
      <Shell icon="alert" tone="bg-bad-bg text-bad" title="No pudimos procesar tu pago." text="No se hizo ningún cobro por el Pass.">
        <div className="grid gap-3">
          <Link href={retry} className="btn btn-navy">
            Intentar nuevamente
          </Link>
          <Link href={tripHref} className="btn btn-outline">
            Volver a Mi Viaje
          </Link>
        </div>
      </Shell>
    );
  }

  if (p.status === 'cancelled') {
    return (
      <Shell icon="close" tone="bg-surface text-text-2" title="El proceso de pago fue cancelado.">
        <div className="grid gap-3">
          <Link href={retry} className="btn btn-navy">
            Intentar nuevamente
          </Link>
          <Link href={tripHref} className="btn btn-outline">
            Volver a Mi Viaje
          </Link>
        </div>
      </Shell>
    );
  }

  if (p.status === 'unknown') {
    return (
      <Shell icon="info" tone="bg-surface text-text-2" title="No conocemos el estado de tu pago" text={`Escríbenos a ${CONTACT.email} con tu referencia ${p.reference}.`}>
        <Link href={tripHref} className="btn btn-outline w-full">
          Volver a Mi Viaje
        </Link>
      </Shell>
    );
  }

  // created / redirected: el usuario volvió de Wompi (o todavía está allá)
  return (
    <Shell icon="card" tone="bg-sky text-blue" title="¿Cómo te fue en Wompi?" text="Cuéntanos para revisar tu pago. Volver aquí no confirma el pago por sí solo.">
      <Field label="Número de transacción de Wompi (opcional)" htmlFor="p-note" hint="Aparece en el comprobante de Wompi o en el correo que te envían. Nos ayuda a verificar más rápido.">
        <input id="p-note" className="input" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div className="mt-5 grid gap-3">
        <button onClick={() => report('paid')} disabled={busy} className="btn btn-navy btn-lg">
          Ya pagué
        </button>
        <button onClick={() => report('failed')} disabled={busy} className="btn btn-outline">
          No pude pagar
        </button>
        <button onClick={() => report('cancelled')} disabled={busy} className="btn btn-ghost">
          Cancelé el pago
        </button>
        <Link href={retry} className="text-center text-sm font-semibold text-blue">
          Volver a abrir Wompi
        </Link>
      </div>
    </Shell>
  );
}
