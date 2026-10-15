'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { RequireAuth } from '@/components/RequireAuth';
import { Spinner } from '@/components/Spinner';
import { api } from '@/lib/api';
import { RESERVATION_FEE } from '@/lib/constants';
import { WhatsAppCard } from '@/components/WhatsAppCta';
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
  const [payment, setPayment] = useState<'reserva' | 'completo'>('reserva');
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
  const charge = payment === 'reserva' ? RESERVATION_FEE : b.total;
  const rows: [string, string, number][] = [
    ['plane', 'Transporte ida y vuelta', b.transporte],
    ['home', 'Alojamiento', b.alojamiento],
    ['mountain', 'Experiencias locales', b.experiencias],
  ];

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1400)); // simula la pasarela
    await api(`/trips/${id}/reserve`, { json: { payment } });
    pixel('Purchase', { value: charge, currency: 'COP' });
    router.push(`/viaje/${id}/pistas?nuevo=1`);
  };

  return (
    <div className="container-app max-w-5xl py-6 md:py-12">
      <p className="eyebrow text-secondary">Último paso</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">Reserva tu sorpresa</h1>
      <p className="mt-3 max-w-xl text-muted">Transporte, alojamiento y planes, todo gestionado por nosotros. Eliges si apartas tu cupo hoy o pagas el viaje completo.</p>

      {/* Las dos formas de pagar */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {[
          {
            id: 'reserva' as const,
            etiqueta: 'Lo más elegido',
            titulo: 'Aparta tu cupo',
            precio: RESERVATION_FEE,
            pie: 'Se abona al total del viaje',
            perks: ['Congelas el precio y la fecha', 'Pagas el resto hasta 15 días antes', 'Las pistas empiezan hoy mismo'],
          },
          {
            id: 'completo' as const,
            etiqueta: 'Sin pendientes',
            titulo: 'Paga todo ahora',
            precio: b.total,
            pie: 'Queda 100 % pago',
            perks: ['No tienes que volver a pagar nada', 'Cambio de fechas sin costo', 'Soporte prioritario del asesor'],
          },
        ].map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => {
              setPayment(op.id);
              track('payment_option', { tripId: id, option: op.id });
            }}
            aria-pressed={payment === op.id}
            className={`relative rounded-3xl border p-5 text-left transition ${
              payment === op.id ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'border-line-strong bg-surface hover:border-muted-2'
            }`}
          >
            <span className="eyebrow text-[10px] text-muted-2">{op.etiqueta}</span>
            <span className="display mt-2 block text-3xl">{op.titulo}</span>
            <span className="mt-2 block font-display text-4xl font-black text-primary">{formatCOP(op.precio)}</span>
            <span className="mt-1 block text-xs text-muted">{op.pie}</span>
            <ul className="mt-4 space-y-1.5 text-sm text-text-soft">
              {op.perks.map((perk) => (
                <li key={perk} className="flex gap-2">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.4} /> {perk}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

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
                <Icon name="sparkle" size={18} className="text-secondary" /> Tarifa fija AiTrava
              </span>
              <span className="font-mono">{formatCOP(b.comision)}</span>
            </li>
          </ul>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-semibold">Total (tu tope)</span>
            <span className="display text-4xl text-primary">{formatCOP(b.total)}</span>
          </div>
          <p className="mt-3 rounded-xl bg-board px-4 py-3 text-xs text-muted">
            <strong className="text-text-soft">Así ganamos:</strong> una tarifa fija de {formatCOP(b.comision)} por viaje, ya incluida en tu presupuesto, más la comisión que nos dejan los aliados por llevarles el cliente. Nunca pagas más de lo que pusiste.
          </p>
          <div className="mt-5 rounded-2xl border border-primary/40 bg-primary/10 p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">Pagas hoy</span>
              <span className="display text-3xl text-primary">{formatCOP(charge)}</span>
            </div>
            {payment === 'reserva' && (
              <p className="mt-1 text-sm text-muted">
                Quedan {formatCOP(b.total - RESERVATION_FEE)} por pagar hasta 15 días antes de viajar.
              </p>
            )}
          </div>
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
          <div className="mt-4">
            <WhatsAppCard
              where="checkout"
              title="¿Prefieres que te ayuden?"
              text="Un asesor te arma el viaje por WhatsApp y resuelve tus dudas al instante."
            />
          </div>
        </div>
      </form>
    </div>
  );
}
