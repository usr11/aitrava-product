'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { ReserveForm } from '@/components/salidas/ReserveForm';
import { DemoBadge, ErrorState, SeatMeter, Sheet } from '@/components/ui';
import { LINES, useConfig } from '@/lib/config';
import { formatCOP, formatDuration, formatLongDate, formatTime, relativeDays } from '@/lib/format';
import { myReservations, track } from '@/lib/track';
import type { Salida } from '@/lib/types';
import { useApi } from '@/lib/useSalidas';

const AFTER = [
  'Te escribimos por WhatsApp para confirmar tu cupo.',
  'Te pasamos los datos de pago del anfitrión: le pagas directo a él con tu referencia.',
  'Un día antes te agregamos al grupo de WhatsApp de la salida.',
];

export default function SalidaPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: s, error, loading, reload } = useApi<Salida>(`/salidas/${encodeURIComponent(slug)}`);
  const config = useConfig();
  const [open, setOpen] = useState(false);
  const viewed = useRef(false);
  const mine = s ? myReservations.list().filter((r) => r.title === s.title && r.startsAt === s.startsAt) : [];

  useEffect(() => {
    if (s && !viewed.current) {
      viewed.current = true;
      track('salida_viewed', { line: s.place.line }, s.slug);
    }
  }, [s]);

  const start = useCallback(() => {
    if (!s) return;
    track('reserve_started', { line: s.place.line }, s.slug);
    setOpen(true);
  }, [s]);
  const close = useCallback(() => setOpen(false), []);

  if (loading)
    return (
      <div className="wrap space-y-4 py-10">
        <div className="skeleton h-10 w-2/3" />
        <div className="skeleton h-48" />
        <div className="skeleton h-32" />
      </div>
    );
  if (error || !s)
    return (
      <div className="wrap py-10">
        <ErrorState title="No encontramos esta salida" text={error ?? undefined} onRetry={reload} />
        <Link href="/salidas" className="btn btn-line mt-6">
          Ver las próximas salidas
        </Link>
      </div>
    );

  const past = new Date(s.startsAt) <= new Date();
  const cta = s.bookable ? 'Reservar mi cupo' : null;
  const why = !s.bookable && (past ? 'Esta salida ya pasó.' : s.seatsLeft === 0 ? 'Se acabaron los cupos.' : 'Esta salida ya no recibe reservas.');

  return (
    <>
      <div className="wrap pt-6 pb-[calc(var(--safe-bottom)+120px)] lg:pb-16">
        <Link href="/salidas" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-ink-2 hover:text-ink">
          <Icon name="back" size={18} /> Salidas
        </Link>

        <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
          <article>
            <div className="flex flex-wrap items-center gap-2 text-ink-2">
              <span className="narrow font-semibold">{LINES[s.place.line].label}</span>
              <span aria-hidden>·</span>
              <span>{s.place.area}</span>
              {s.isDemo && <DemoBadge />}
              {s.womenOnly && <span className="narrow rounded-full bg-paper-2 px-2 py-0.5 text-sm font-semibold">Solo mujeres</span>}
            </div>
            <h1 className="display mt-3 text-[2.4rem] sm:text-[3.4rem]">{s.title}</h1>

            <dl className="mt-8 grid gap-5 border-y border-line py-6 sm:grid-cols-2">
              <div className="flex gap-3">
                <Icon name="calendar" className="mt-0.5 shrink-0 text-forest" />
                <div>
                  <dt className="sr-only">Fecha</dt>
                  <dd className="font-bold">{formatLongDate(s.startsAt)}</dd>
                  <dd className="text-ink-2">
                    <span className="tnum">{formatTime(s.startsAt)}</span> · {formatDuration(s.durationMin)} · {relativeDays(s.startsAt)}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Icon name="pin" className="mt-0.5 shrink-0 text-forest" />
                <div>
                  <dt className="sr-only">Punto de encuentro</dt>
                  <dd className="font-bold">{s.place.name}</dd>
                  <dd className="text-ink-2">{s.meetingPoint}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Icon name="users" className="mt-0.5 shrink-0 text-forest" />
                <div>
                  <dt className="sr-only">Grupo</dt>
                  <dd className="font-bold">Grupo de hasta {s.capacity} personas</dd>
                  <dd className="text-ink-2">Sale con mínimo {s.minToRun}. Si no se llega, te devolvemos todo.</dd>
                </div>
              </div>
              {s.host && (
                <div className="flex gap-3">
                  <Icon name="user" className="mt-0.5 shrink-0 text-forest" />
                  <div>
                    <dt className="sr-only">Anfitrión</dt>
                    <dd className="font-bold">{s.host.organization ?? s.host.name}</dd>
                    <dd className="text-ink-2">Anfitrión local{s.host.hasRnt ? ' con RNT' : ''}</dd>
                  </div>
                </div>
              )}
            </dl>

            <p className="lede mt-8 text-ink-2">{s.summary}</p>

            {s.includes.length > 0 && (
              <section className="mt-10" aria-labelledby="incluye">
                <h2 id="incluye" className="title text-[1.4rem]">
                  Qué incluye
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {s.includes.map((i) => (
                    <li key={i} className="flex gap-2.5">
                      <Icon name="check" className="mt-0.5 shrink-0 text-forest" />
                      {i}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-10" aria-labelledby="despues">
              <h2 id="despues" className="title text-[1.4rem]">
                Después de apartar
              </h2>
              <ol className="mt-4 space-y-3">
                {AFTER.map((a, i) => (
                  <li key={a} className="flex gap-3">
                    <span className="display tnum w-6 shrink-0 text-[1.3rem] text-ember">{i + 1}</span>
                    <span className="text-ink-2">{a}</span>
                  </li>
                ))}
              </ol>
            </section>

            {config && (
              <section className="mt-10" aria-labelledby="reembolso">
                <h2 id="reembolso" className="title text-[1.4rem]">
                  Si no puedes ir
                </h2>
                <ul className="mt-4 space-y-2 text-ink-2">
                  {config.refundPolicy.map((r) => (
                    <li key={r} className="flex gap-2.5">
                      <Icon name="refresh" size={18} className="mt-1 shrink-0 text-forest" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          {/* Escritorio: tarjeta fija con cupos y precio */}
          <aside className="hidden lg:block">
            <div className="ticket sticky top-24">
              <div className="p-6">
                <p className="display tnum text-[2.2rem] leading-none">{formatCOP(s.price + s.serviceFee)}</p>
                <p className="mt-1 text-sm text-ink-3">por persona, se le paga al anfitrión</p>
              </div>
              <div className="perforation mx-6" aria-hidden />
              <div className="space-y-4 p-6">
                <SeatMeter capacity={s.capacity} taken={s.seatsTaken} size="lg" />
                {cta ? (
                  <button onClick={start} className="btn btn-ember btn-block">
                    {cta}
                  </button>
                ) : (
                  <>
                    <p className="font-semibold text-flare-ink">{why}</p>
                    <Link href="/salidas#lista" className="btn btn-pine btn-block">
                      Avísame de la próxima
                    </Link>
                  </>
                )}
                {mine.map((r) => (
                  <Link key={r.code} href={`/reserva/${r.code}?t=${encodeURIComponent(r.token)}`} className="link block text-center text-sm">
                    Ya tienes la reserva {r.code}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Móvil: barra fija con la acción principal siempre a la mano */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[var(--safe-bottom)] backdrop-blur lg:hidden">
        <div className="wrap flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="display tnum text-[1.4rem] leading-none">{formatCOP(s.price + s.serviceFee)}</p>
            <p className={`narrow mt-1 truncate text-sm font-semibold ${s.seatsLeft <= 2 ? 'text-flare-ink' : 'text-ink-2'}`}>
              {s.seatsLeft === 0 ? 'Cupos agotados' : `Quedan ${s.seatsLeft} de ${s.capacity}`}
            </p>
          </div>
          {cta ? (
            <button onClick={start} className="btn btn-ember shrink-0">
              {cta}
            </button>
          ) : mine[0] ? (
            <Link href={`/reserva/${mine[0].code}?t=${encodeURIComponent(mine[0].token)}`} className="btn btn-pine shrink-0">
              Ver mi reserva
            </Link>
          ) : (
            <Link href="/salidas#lista" className="btn btn-pine shrink-0">
              Avísame de la próxima
            </Link>
          )}
        </div>
      </div>

      <Sheet open={open} onClose={close} title="Aparta tu cupo" wide>
        <p className="mb-5 text-ink-2">
          {s.title} · <span>{formatLongDate(s.startsAt)}</span>
        </p>
        <ReserveForm salida={s} refundPolicy={config?.refundPolicy ?? []} />
      </Sheet>
    </>
  );
}
