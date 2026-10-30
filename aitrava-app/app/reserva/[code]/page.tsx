'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Alert, ConfirmDialog, DemoBadge, ErrorState, Sheet } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useConfig } from '@/lib/config';
import { formatCOP, formatDuration, formatLongDate, formatTime } from '@/lib/format';
import { whatsappLink } from '@/lib/site';
import { myReservations, track } from '@/lib/track';
import type { ReservationStatus, ReservationView } from '@/lib/types';

/** La escalera que ve el viajero (de apartar a salir). */
const STEPS: { key: string; label: string; reached: ReservationStatus[] }[] = [
  { key: 'apartado', label: 'Cupo apartado', reached: ['requested', 'confirmed', 'payment_reported', 'paid', 'attended'] },
  { key: 'confirmado', label: 'Cupo confirmado', reached: ['confirmed', 'payment_reported', 'paid', 'attended'] },
  { key: 'pago', label: 'Pago reportado', reached: ['payment_reported', 'paid', 'attended'] },
  { key: 'verificado', label: 'Pago verificado', reached: ['paid', 'attended'] },
  { key: 'salida', label: 'Salida', reached: ['attended'] },
];

const HEADLINE: Record<ReservationStatus, string> = {
  requested: 'Tu cupo está apartado',
  confirmed: 'Tu cupo está confirmado',
  payment_reported: 'Estamos verificando tu pago',
  paid: 'Todo listo, nos vemos allá',
  attended: 'Gracias por venir',
  no_show: 'Te extrañamos en la salida',
  cancelled: 'Reserva cancelada',
  expired: 'Tu apartado venció',
};

function Reserva() {
  const { code } = useParams<{ code: string }>();
  const params = useSearchParams();
  const token = params.get('t') ?? '';
  const isNew = params.get('nueva') === '1';
  const [r, setR] = useState<ReservationView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const config = useConfig();

  const load = useCallback(async () => {
    setError(null);
    if (token.length < 20) {
      setError('Este enlace está incompleto. Ábrelo desde el mensaje o el celular donde reservaste.');
      return;
    }
    try {
      setR(await api<ReservationView>(`/reservations/${encodeURIComponent(code)}?token=${encodeURIComponent(token)}`));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No pudimos cargar tu reserva.');
    }
  }, [code, token]);

  useEffect(() => {
    void load();
  }, [load]);

  // Guarda la reserva en este celular para volver sin buscar el enlace.
  useEffect(() => {
    if (r) myReservations.add({ code: r.code, token, title: r.salida.title, startsAt: r.salida.startsAt });
  }, [r, token]);

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const act = async (path: 'payment' | 'cancel', body: Record<string, unknown>) => {
    setBusy(true);
    setActionError(null);
    try {
      setR(await api<ReservationView>(`/reservations/${encodeURIComponent(code)}/${path}`, { json: { token, ...body } }));
      return true;
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'No pudimos guardar el cambio. Intenta de nuevo.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (error)
    return (
      <div className="wrap max-w-2xl py-10">
        <ErrorState title="No pudimos abrir tu reserva" text={error} onRetry={token.length >= 20 ? load : undefined} />
        <p className="mt-6 text-ink-2">
          ¿Perdiste el enlace?{' '}
          <a className="link" href={whatsappLink(`Hola, perdí el enlace de mi reserva ${code}.`)} target="_blank" rel="noopener noreferrer">
            Escríbenos por WhatsApp
          </a>{' '}
          y te mandamos uno nuevo.
        </p>
      </div>
    );
  if (!r)
    return (
      <div className="wrap max-w-2xl space-y-4 py-10" role="status">
        <span className="sr-only">Cargando tu reserva…</span>
        <div className="skeleton h-12 w-3/4" />
        <div className="skeleton h-40" />
        <div className="skeleton h-24" />
      </div>
    );

  const date = `${formatLongDate(r.salida.startsAt).toLowerCase()} a las ${formatTime(r.salida.startsAt)}`;
  const waText =
    r.status === 'requested'
      ? `Hola, soy ${r.name}. Aparté el cupo ${r.code} para "${r.salida.title}" el ${date}. ¿Me confirman?`
      : r.status === 'confirmed' || r.status === 'payment_reported'
        ? `Hola, soy ${r.name}. Te envío el comprobante de pago de mi reserva ${r.code} ("${r.salida.title}").`
        : `Hola, soy ${r.name}, tengo la reserva ${r.code} ("${r.salida.title}").`;
  const wa = (
    <a
      href={whatsappLink(waText)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('whatsapp_clicked', { from: 'reserva', status: r.status })}
      className="btn btn-ember btn-block sm:w-auto"
    >
      <Icon name="whatsapp" />
      {r.status === 'requested' ? 'Confirmar por WhatsApp' : r.status === 'confirmed' || r.status === 'payment_reported' ? 'Enviar el comprobante' : 'Escribirnos por WhatsApp'}
    </a>
  );
  const active = !['cancelled', 'expired', 'no_show'].includes(r.status);
  const link = typeof window !== 'undefined' ? window.location.href.replace(/[?&]nueva=1/, '') : '';

  return (
    <div className="wrap max-w-3xl py-8 lg:py-12">
      {isNew && r.status === 'requested' && (
        <Alert tone="ok">
          <strong>Listo, apartaste tu cupo.</strong> Guarda esta página: es tu enlace privado a la reserva.
        </Alert>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => copy(r.code, 'code')}
          className="narrow tnum inline-flex min-h-11 items-center gap-2 rounded-full bg-pine px-4 font-bold text-paper"
          aria-label={`Copiar la referencia ${r.code}`}
        >
          {r.code} <Icon name={copied === 'code' ? 'check' : 'copy'} size={18} />
        </button>
        {r.isDemo && <DemoBadge />}
      </div>
      <h1 className="display mt-4 text-[2.3rem] sm:text-[3rem]">{HEADLINE[r.status]}</h1>
      <p className="mt-2 text-lg text-ink-2">{r.salida.title}</p>

      {active && (
        <ol className="mt-8 grid grid-cols-5 gap-1.5" aria-label="Estado de tu reserva">
          {STEPS.map((s) => {
            const done = s.reached.includes(r.status);
            return (
              <li key={s.key} className="min-w-0">
                <span className={`block h-1.5 rounded-full ${done ? 'bg-pine' : 'bg-line'}`} aria-hidden />
                <span className={`narrow mt-2 block text-[0.78rem] leading-tight sm:text-sm ${done ? 'font-semibold text-ink' : 'text-ink-3'}`}>
                  {s.label}
                  <span className="sr-only">{done ? ' (hecho)' : ' (pendiente)'}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {/* Qué hacer ahora: una sola acción principal por estado */}
      <section className="panel mt-8 space-y-4 p-5 sm:p-6">
        {r.status === 'requested' && (
          <>
            <p>
              Escríbenos por WhatsApp para confirmar tu cupo y te pasamos los datos de pago del anfitrión. Te lo guardamos hasta el{' '}
              <strong>{formatLongDate(r.holdUntil).toLowerCase()} a las {formatTime(r.holdUntil)}</strong>
            </p>
            {wa}
          </>
        )}
        {r.status === 'confirmed' && (
          <>
            <p>
              Paga <strong className="tnum">{formatCOP(r.price + r.serviceFee)}</strong> directo al anfitrión y pon tu referencia{' '}
              <strong className="tnum">{r.code}</strong> en el pago.
            </p>
            {r.paymentInstructions && (
              <div className="rounded-xl border-2 border-dashed border-line bg-paper p-4">
                <p className="whitespace-pre-line font-semibold">{r.paymentInstructions}</p>
                <button onClick={() => copy(r.paymentInstructions!, 'pay')} className="link mt-2 inline-flex items-center gap-1 text-sm">
                  <Icon name={copied === 'pay' ? 'check' : 'copy'} size={16} /> {copied === 'pay' ? 'Copiado' : 'Copiar datos de pago'}
                </button>
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setPayOpen(true)} className="btn btn-pine">
                Ya pagué
              </button>
              {wa}
            </div>
          </>
        )}
        {r.status === 'payment_reported' && (
          <>
            <p>Gracias. Apenas veamos el comprobante te confirmamos. Si no lo has enviado, mándalo por WhatsApp.</p>
            {wa}
          </>
        )}
        {r.status === 'paid' && (
          <>
            <p>Tu pago está verificado. Un día antes te agregamos al grupo de WhatsApp de la salida, donde conoces a los demás.</p>
            <p className="text-ink-2">Lleva ropa cómoda, agua y ganas de conversar. Del resto nos encargamos.</p>
          </>
        )}
        {r.status === 'attended' &&
          (r.can.survey ? (
            <>
              <p>¿Cómo te fue? Son 5 preguntas y nos ayudan a mejorar la próxima salida.</p>
              <Link href={`/encuesta/${r.code}?t=${encodeURIComponent(token)}`} className="btn btn-ember">
                Responder la encuesta
              </Link>
            </>
          ) : (
            <p>Gracias por responder la encuesta. Te avisamos de la próxima salida.</p>
          ))}
        {r.status === 'expired' && (
          <>
            <p>Pasaron las {config?.holdHours ?? 48} horas sin confirmar el pago y el cupo quedó libre. Si ya pagaste, escríbenos y lo resolvemos.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {wa}
              <Link href={`/salidas/${r.salida.slug}`} className="btn btn-line">
                Volver a la salida
              </Link>
            </div>
          </>
        )}
        {r.status === 'cancelled' && (
          <>
            <p>Cancelaste esta reserva{r.refundNote ? `. ${r.refundNote}` : '.'}</p>
            <Link href="/salidas" className="btn btn-pine">
              Ver otras salidas
            </Link>
          </>
        )}
        {r.status === 'no_show' && <p>No te vimos en la salida. Si fue un error, escríbenos por WhatsApp.</p>}
        {actionError && <Alert tone="bad">{actionError}</Alert>}
      </section>

      <section className="mt-8" aria-labelledby="detalle">
        <h2 id="detalle" className="title text-[1.3rem]">
          La salida
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-ink-3">Cuándo</dt>
            <dd className="font-semibold">{formatLongDate(r.salida.startsAt)}, {formatTime(r.salida.startsAt)}</dd>
            <dd className="text-ink-2">{formatDuration(r.salida.durationMin)}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-3">Dónde nos vemos</dt>
            <dd className="font-semibold">{r.salida.place.name}</dd>
            <dd className="text-ink-2">{r.salida.meetingPoint}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-3">Valor</dt>
            <dd className="tnum font-semibold">{formatCOP(r.price + r.serviceFee)}</dd>
            <dd className="text-ink-2">Se le paga al anfitrión</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-3">Reto del sobre</dt>
            <dd className="font-semibold">{r.phoneChallenge ? 'Te animaste' : 'No esta vez'}</dd>
            <dd className="text-ink-2">Puedes cambiar de idea el mismo día</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 flex flex-col gap-3 border-t border-line pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <button onClick={() => copy(link, 'link')} className="link inline-flex items-center gap-1.5 self-start">
          <Icon name={copied === 'link' ? 'check' : 'copy'} size={16} /> {copied === 'link' ? 'Enlace copiado' : 'Copiar el enlace de esta reserva'}
        </button>
        {r.can.cancel && (
          <button onClick={() => setCancelOpen(true)} className="self-start font-semibold text-flare-ink underline underline-offset-4">
            Cancelar mi reserva
          </button>
        )}
      </section>

      <Sheet open={payOpen} onClose={() => setPayOpen(false)} title="Reportar mi pago">
        <p className="text-ink-2">Le avisamos al equipo para que lo verifique. Si puedes, envía el comprobante por WhatsApp.</p>
        <label className="label mt-5" htmlFor="pay-note">
          ¿Por dónde pagaste? <span className="font-normal text-ink-3">(opcional)</span>
        </label>
        <input id="pay-note" className="input" placeholder="Ej.: Nequi a las 3:15 p. m." value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
        {actionError && (
          <div className="mt-4">
            <Alert tone="bad">{actionError}</Alert>
          </div>
        )}
        <button
          disabled={busy}
          onClick={async () => {
            if (await act('payment', { note: note || undefined })) setPayOpen(false);
          }}
          className="btn btn-pine btn-block mt-6"
        >
          {busy ? 'Enviando…' : 'Reportar mi pago'}
        </button>
      </Sheet>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="¿Cancelar tu reserva?"
        confirmLabel="Sí, cancelar"
        text={
          <>
            <p>{r.refund.text}</p>
            <p className="mt-2">Si prefieres, puedes ceder tu cupo a otra persona sin costo: escríbenos por WhatsApp.</p>
          </>
        }
        onConfirm={async () => {
          await act('cancel', {});
        }}
      />
    </div>
  );
}

export default function ReservaPage() {
  return (
    <Suspense>
      <Reserva />
    </Suspense>
  );
}
