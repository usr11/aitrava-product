'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { RequireAuth } from '@/components/RequireAuth';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/lib/auth';
import { WHATSAPP_URL } from '@/lib/constants';
import { flightCode, formatCOP, formatDate } from '@/lib/format';
import { useTrip } from '@/lib/useTrip';

export default function InvoicePage() {
  return (
    <RequireAuth>
      <Invoice />
    </RequireAuth>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 border-b border-ink/10 py-2.5 ${strong ? 'font-bold' : ''}`}>
      <span className={strong ? '' : 'text-ink/70'}>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function Invoice() {
  const { id } = useParams<{ id: string }>();
  const { trip, error } = useTrip(id);
  const { user } = useAuth();

  if (error) return <p className="container-app py-20 text-center text-muted">{error}</p>;
  if (!trip || !user) return <Spinner full />;

  if (trip.status === 'GENERATED') {
    return (
      <div className="container-app max-w-xl py-16 text-center">
        <p className="display text-4xl">Todavía no hay factura</p>
        <p className="mt-3 text-muted">La factura se genera cuando reservas o pagas tu viaje.</p>
        <Link href={`/viaje/${id}/pago`} className="btn btn-primary mt-6">
          Ir a reservar <Icon name="arrow" size={18} />
        </Link>
      </div>
    );
  }

  const b = trip.breakdown;
  const pagado = trip.amountPaid ?? 0;
  const saldo = Math.max(0, b.total - pagado);
  const esReserva = trip.paymentType === 'reserva';
  const emitida = trip.reservedAt ?? trip.createdAt;

  return (
    <div className="container-app max-w-3xl py-6 md:py-10">
      {/* Acciones (no salen al imprimir) */}
      <div className="print:hidden mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/viaje/${id}`} className="btn btn-ghost -ml-3">
          <Icon name="back" size={18} /> Volver al viaje
        </Link>
        <button onClick={() => window.print()} className="btn btn-primary">
          <Icon name="download" size={18} /> Imprimir o guardar en PDF
        </button>
      </div>

      {/* Documento */}
      <article id="factura" className="overflow-hidden rounded-3xl bg-white text-ink shadow-2xl shadow-black/40 print:rounded-none print:shadow-none">
        <header className="flex items-center justify-between gap-4 bg-ink px-6 py-5 text-text">
          <Logo size={34} />
          <div className="text-right">
            <p className="eyebrow text-primary">Factura de venta</p>
            <p className="font-mono text-sm">N.º FAC-{flightCode(trip.id)}</p>
          </div>
        </header>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <section>
              <p className="eyebrow text-[10px] text-ink/50">Cliente</p>
              <p className="mt-1 font-bold">{user.name}</p>
              <p className="text-sm text-ink/70">C.C. {user.idNumber ?? '—'}</p>
              <p className="text-sm text-ink/70">Tel. {user.phone ?? '—'}</p>
              <p className="text-sm text-ink/70">{user.email}</p>
            </section>
            <section className="sm:text-right">
              <p className="eyebrow text-[10px] text-ink/50">Emitida</p>
              <p className="mt-1 font-bold">{formatDate(emitida, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-sm text-ink/70">Reserva {flightCode(trip.id)}</p>
              <p className="text-sm text-ink/70">
                {trip.originCity} → {trip.destination?.name ?? 'Destino sorpresa'}
              </p>
            </section>
          </div>

          <section>
            <p className="eyebrow text-[10px] text-ink/50">Detalle del viaje</p>
            <p className="mt-1 text-sm text-ink/70">
              {formatDate(trip.startDate)} al {formatDate(trip.endDate)} · {trip.travelers}{' '}
              {trip.travelers === 1 ? 'pasajero' : 'pasajeros'}
              {trip.isGift && trip.giftTo ? ` · regalo para ${trip.giftTo}` : ''}
            </p>
            <div className="mt-3">
              <Row label="Transporte ida y vuelta" value={formatCOP(b.transporte)} />
              <Row label="Alojamiento" value={formatCOP(b.alojamiento)} />
              <Row label="Experiencias locales" value={formatCOP(b.experiencias)} />
              <Row label="Tarifa de servicio AiTrava" value={formatCOP(b.comision)} />
              <Row label="Total del viaje" value={formatCOP(b.total)} strong />
            </div>
          </section>

          <section className="rounded-2xl bg-ink/5 p-5">
            <p className="eyebrow text-[10px] text-ink/50">Pago</p>
            <div className="mt-2">
              <Row label="Forma de pago" value={esReserva ? 'Reserva (abono)' : 'Pago completo'} />
              <Row label="Medio" value="Tarjeta de crédito" />
              <Row label="Pagado" value={formatCOP(pagado)} strong />
              {saldo > 0 && <Row label="Saldo pendiente (hasta 15 días antes del viaje)" value={formatCOP(saldo)} />}
            </div>
            <p className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${saldo > 0 ? 'bg-primary text-ink' : 'bg-ink text-primary'}`}>
              {saldo > 0 ? 'Cupo apartado' : 'Pagado en su totalidad'}
            </p>
          </section>

          <footer className="flex flex-wrap items-end justify-between gap-4 border-t border-ink/10 pt-5 text-xs text-ink/60">
            <div>
              <p className="font-bold text-ink">AiTrava · Viajes sorpresa personalizados</p>
              <p>Soporte por WhatsApp: {WHATSAPP_URL.replace('https://', '')}</p>
              <p className="mt-2">
                Documento de soporte del prototipo AiTrava. No tiene validez fiscal: en esta versión el cobro es simulado.
              </p>
            </div>
            <p className="font-mono">{formatDate(emitida, { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </footer>
        </div>
      </article>
    </div>
  );
}
