'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { RequireAuth } from '@/components/RequireAuth';
import { Spinner } from '@/components/Spinner';
import { api } from '@/lib/api';
import { DEPOSIT_AMOUNT } from '@/lib/constants';
import { formatCOP } from '@/lib/format';
import { pixel, track } from '@/lib/track';
import { useTrip } from '@/lib/useTrip';

export default function PaymentPage() {
  return (
    <RequireAuth>
      <Payment />
    </RequireAuth>
  );
}

function Payment() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { trip, error } = useTrip(id);
  const [deposit, setDeposit] = useState(false);
  const [paying, setPaying] = useState(false);
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', name: '', exp: '12/28', cvc: '123' });
  const viewed = useRef(false);

  useEffect(() => {
    if (!trip || viewed.current) return;
    viewed.current = true;
    track('checkout_view', { tripId: id });
    pixel('InitiateCheckout');
    if (trip.status !== 'GENERATED') router.replace(`/viaje/${id}`);
  }, [trip, id, router]);

  if (error) return <p className="container-app py-20 text-center text-muted">{error}</p>;
  if (!trip) return <Spinner full />;

  const b = trip.breakdown;
  const charge = deposit ? DEPOSIT_AMOUNT : b.total;
  const rows: [string, string, number][] = [
    ['plane', 'Transporte ida y vuelta', b.transporte],
    ['home', 'Alojamiento', b.alojamiento],
    ['mountain', 'Experiencias locales', b.experiencias],
  ];

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1400)); // simula la pasarela
    await api(`/trips/${id}/reserve`, { json: { deposit } });
    pixel('Purchase', { value: charge, currency: 'COP' });
    router.push(`/viaje/${id}/pistas?nuevo=1`);
  };

  return (
    <div className="container-app max-w-5xl py-6 md:py-12">
      <p className="eyebrow text-secondary">Último paso</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">Reserva tu sorpresa</h1>
      <p className="mt-3 max-w-xl text-muted">Un solo pago y todo queda listo: transporte, alojamiento y planes. Sin planes que elegir ni cobros escondidos.</p>

      <form onSubmit={pay} className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <p className="eyebrow text-muted-2">Resumen</p>
          <ul className="mt-4 space-y-3 text-sm">
            {rows.map(([icon, label, value]) => (
              <li key={label} className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <span className="flex items-center gap-2.5 text-text-soft">
                  <Icon name={icon as 'plane'} size={18} className="text-secondary" /> {label}
                </span>
                <span className="font-mono">{formatCOP(value)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-3 border-b border-line pb-3">
              <span className="flex items-center gap-2.5 text-text-soft">
                <Icon name="sparkle" size={18} className="text-secondary" /> Comisión AiTrava ({Math.round(b.commissionRate * 100)} %)
              </span>
              <span className="font-mono">{formatCOP(b.comision)}</span>
            </li>
          </ul>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-semibold">Total (tu tope)</span>
            <span className="display text-4xl text-primary">{formatCOP(b.total)}</span>
          </div>
          <p className="mt-3 rounded-xl bg-board px-4 py-3 text-xs text-muted">
            <strong className="text-text-soft">Así ganamos:</strong> una comisión por viaje, ya incluida en tu presupuesto. Nunca pagas más de lo que pusiste.
          </p>
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-line-strong p-4">
            <input type="checkbox" className="mt-1 size-5 accent-primary" checked={deposit} onChange={(e) => setDeposit(e.target.checked)} />
            <span>
              <span className="font-semibold">Solo apartar con {formatCOP(DEPOSIT_AMOUNT)}</span>
              <span className="block text-sm text-muted">Congela tu cupo y paga el resto hasta 15 días antes.</span>
            </span>
          </label>
        </div>

        <div className="card p-5 sm:p-6">
          <p className="eyebrow text-muted-2">Pago</p>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="field-label">Número de tarjeta</span>
              <input className="input font-mono" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} inputMode="numeric" />
            </label>
            <label className="block">
              <span className="field-label">Nombre en la tarjeta</span>
              <input className="input" required value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Como aparece en la tarjeta" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label><span className="field-label">Vence</span><input className="input font-mono" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} /></label>
              <label><span className="field-label">CVC</span><input className="input font-mono" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} /></label>
            </div>
          </div>
          <button className="btn btn-primary btn-lg mt-6 w-full" disabled={paying}>
            {paying ? 'Procesando…' : `Pagar ${formatCOP(charge)}`} {!paying && <Icon name="lock" size={18} />}
          </button>
          <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-center text-xs text-primary">
            Prototipo: no se hace ningún cobro real. Usa cualquier dato.
          </p>
        </div>
      </form>
    </div>
  );
}
