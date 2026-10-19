'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { RequireAuth } from '@/components/RequireAuth';
import { Alert, BackLink, ErrorState, LoadingState } from '@/components/ui';
import { api, API_URL, ApiError, tokenStore } from '@/lib/api';
import { useConfig } from '@/lib/config';
import { formatCOP, formatDate } from '@/lib/format';
import { track } from '@/lib/track';
import type { Payment } from '@/lib/types';

type Checkout = {
  payment: Payment;
  paymentUrl: string;
  trip: { id: string; title: string; destinationCity: string; destinationCountry: string; startDate: string };
  user: { firstName: string; lastName: string; email: string; emailVerified: boolean };
};

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutView />
    </RequireAuth>
  );
}

function CheckoutView() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();
  const config = useConfig();
  const [data, setData] = useState<Checkout | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const tracked = useRef(false);

  const load = () => {
    setError(null);
    api<Checkout>('/payments/checkout', { json: { tripId } })
      .then((d) => {
        setData(d);
        if (!tracked.current) {
          tracked.current = true;
          track('checkout_viewed', { amount: d.payment.amount }, tripId);
        }
      })
      .catch((e: ApiError) => setError(e));
  };
  useEffect(load, [tripId]);

  /** Abre Wompi en otra pestaña y deja esta en "¿ya pagaste?". Volver NO significa pagar. */
  const goToWompi = () => {
    if (!data) return;
    track('payment_cta_clicked', { amount: data.payment.amount }, tripId);
    const token = tokenStore.get();
    fetch(`${API_URL}/api/payments/${data.payment.id}/redirect`, {
      method: 'POST',
      keepalive: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {});
    setTimeout(() => router.push(`/pago/resultado?ref=${data.payment.id}`), 400);
  };

  if (error) {
    return (
      <div className="container-app max-w-xl py-10">
        <ErrorState title={error.status === 409 ? 'Este viaje ya tiene el Pass' : 'No pudimos abrir el checkout'} text={error.message} onRetry={error.status === 409 ? undefined : load} />
        <div className="mt-4 text-center">
          <Link href={`/viajes/${tripId}`} className="btn btn-outline">
            Volver a Mi Viaje
          </Link>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="container-app max-w-xl py-10">
        <LoadingState label="Preparando tu checkout…" />
      </div>
    );
  }

  return (
    <div className="bg-surface">
      <div className="container-app max-w-xl py-6 pb-12">
        <BackLink href={`/viajes/${tripId}`} label="Volver a Mi Viaje" />
        <div className="card mt-3 overflow-hidden">
          <div className="bg-navy p-6 text-white">
            <p className="eyebrow text-yellow">AITRAVA Pass</p>
            <h1 className="mt-2 text-2xl font-extrabold">Lleva este viaje contigo.</h1>
            <ul className="mt-4 space-y-2">
              {(config?.passFeatures ?? []).map((f) => (
                <li key={f} className="flex items-start gap-2 text-white/90">
                  <Icon name="check" size={18} className="mt-0.5 shrink-0 text-yellow" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <dl className="divide-y divide-line px-6">
            <div className="flex justify-between gap-4 py-4">
              <dt className="text-text-2">Viaje</dt>
              <dd className="text-right font-semibold text-navy">
                {data.trip.destinationCity}, {data.trip.destinationCountry}
                <span className="block text-sm font-normal text-text-2">{data.trip.title}</span>
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-4">
              <dt className="text-text-2">Usuario</dt>
              <dd className="text-right font-semibold text-navy">
                {data.user.firstName} {data.user.lastName}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-4">
              <dt className="text-text-2">Correo</dt>
              <dd className="flex min-w-0 items-center gap-2 text-right font-semibold text-navy">
                <span className="truncate">{data.user.email}</span>
                {data.user.emailVerified && <span className="badge shrink-0 bg-ok-bg text-ok">Verificado</span>}
              </dd>
            </div>
            <div className="flex items-end justify-between gap-4 py-5">
              <dt className="text-text-2">Precio</dt>
              <dd className="text-right">
                <span className="num text-3xl font-extrabold text-navy">{formatCOP(data.payment.amount)}</span>{' '}
                <span className="font-semibold text-text-2">COP</span>
                <span className="block text-sm text-text-2">por este viaje · pago único</span>
              </dd>
            </div>
          </dl>
          <div className="space-y-3 p-6 pt-0">
            <a href={data.paymentUrl} target="_blank" rel="noopener noreferrer" onClick={goToWompi} className="btn btn-primary btn-lg w-full">
              Activar AITRAVA Pass
            </a>
            <p className="flex items-center justify-center gap-2 text-sm text-text-2">
              <Icon name="lock" size={16} /> Pago seguro procesado mediante Wompi.
            </p>
            <p className="text-center text-xs text-text-3">Referencia interna: {data.payment.reference} · Salida {formatDate(data.trip.startDate, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="mt-5">
          <Alert tone="info">
            El pago corresponde únicamente al acceso/servicio AITRAVA Pass para este viaje. No corresponde al pago de vuelos, hoteles, actividades u otros servicios
            turísticos mostrados en la plataforma.
          </Alert>
        </div>
        <p className="mt-4 text-center text-xs text-text-2">AITRAVA nunca te pide datos de tarjeta ni claves: el pago se hace en la página de Wompi.</p>
      </div>
    </div>
  );
}
