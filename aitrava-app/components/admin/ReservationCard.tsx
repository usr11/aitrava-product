'use client';

import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { AdminReservation } from '@/lib/admin-types';
import { formatDateTime } from '@/lib/format';
import type { ReservationStatus } from '@/lib/types';
import { Icon } from '../Icon';
import { Badge } from '../ui';
import { NEXT, STATUS, StatusBadge, prettyPhone, waLink } from './kit';

const V_LABELS = { v1: 'Mayor de edad', v2: 'En Cali', v3: 'No es del círculo del equipo', v4: 'Canal de AiTrava', v5: 'Intención válida' } as const;

/** Una reserva con todo lo que el equipo hace sobre ella: estado, V1–V5, reto, encuesta y enlaces. */
export function ReservationCard({ r, onChange, showSalida = false }: { r: AdminReservation; onChange: (r: AdminReservation) => void; showSalida?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      onChange(await api<AdminReservation>(`/admin/reservations/${r.id}`, { method: 'PATCH', json: body }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  };

  const makeLink = async (kind: 'survey-link' | 'access-link') => {
    if (kind === 'access-link' && !confirm('El enlace anterior de esta reserva dejará de funcionar. ¿Generar uno nuevo?')) return;
    setError(null);
    try {
      const res = await api<{ url: string }>(`/admin/reservations/${r.id}/${kind}`, { method: 'POST' });
      setLink(res.url);
      if (kind === 'survey-link') onChange({ ...r, hasSurveyLink: true });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo generar el enlace.');
    }
  };

  const status: ReservationStatus = r.holdExpired ? 'expired' : r.status;
  const first = r.name.split(' ')[0];
  const qualifies = r.profile.qualifies;

  return (
    <article className="panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="narrow tnum font-bold">{r.code}</span>
            <StatusBadge status={r.status} expired={r.holdExpired} />
            {qualifies === true && <Badge tone="ok">V1–V5</Badge>}
            {qualifies === false && <Badge tone="bad">No cuenta</Badge>}
            {qualifies === null && <Badge tone="warn">Revisar V5</Badge>}
            {r.isDemo && <Badge tone="warn">DEMO</Badge>}
          </p>
          <p className="mt-1 font-semibold">{r.name}</p>
          <a href={waLink(r.phone)} target="_blank" rel="noopener noreferrer" className="link tnum text-sm">
            {prettyPhone(r.phone)}
          </a>
          {showSalida && r.salida && (
            <p className="text-sm text-ink-3">
              {r.salida.title} · {formatDateTime(r.salida.startsAt)}
              {r.salida.isSimulacro ? ' · simulacro' : ''}
            </p>
          )}
        </div>
        <label className="text-sm">
          <span className="sr-only">Cambiar estado</span>
          <select
            className="input min-h-10 py-1.5 text-sm"
            value=""
            disabled={busy}
            onChange={(e) => e.target.value && patch({ status: e.target.value })}
          >
            <option value="">Cambiar a…</option>
            {NEXT[status].map((s) => (
              <option key={s} value={s}>
                {STATUS[s].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-3 rounded-lg bg-paper-2 p-3 text-[0.95rem] text-ink-2">“{r.motivation}”</p>

      <div className="mt-3 flex flex-wrap gap-1.5 text-sm">
        {(['v1', 'v2', 'v3', 'v4'] as const).map((k) => (
          <span key={k} className={`narrow rounded-full px-2 py-0.5 ${r.profile[k] ? 'bg-ok-bg text-ok' : 'bg-flare-bg text-flare-ink'}`} title={V_LABELS[k]}>
            {k.toUpperCase()} {r.profile[k] ? '✓' : '✗'}
          </span>
        ))}
        <span className="narrow inline-flex items-center gap-1 rounded-full bg-paper-2 px-2 py-0.5">V5:</span>
        {[true, false].map((v) => (
          <button
            key={String(v)}
            disabled={busy}
            onClick={() => patch({ intentValid: v })}
            aria-pressed={r.intentValid === v}
            className={`narrow min-h-8 rounded-full border px-2.5 ${r.intentValid === v ? 'border-pine bg-pine text-paper' : 'border-line'}`}
          >
            {v ? 'Intención válida' : 'No'}
          </button>
        ))}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-ink-2 sm:grid-cols-4">
        <div>
          <dt className="text-ink-3">Llegó por</dt>
          <dd>
            {r.channel ?? '—'} / dijo {r.heardFrom}
          </dd>
        </div>
        <div>
          <dt className="text-ink-3">Variante</dt>
          <dd>{r.variant ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-ink-3">Viene</dt>
          <dd>{r.comesAlone ? 'Solo' : 'Acompañado'}</dd>
        </div>
        <div>
          <dt className="text-ink-3">Apartó</dt>
          <dd>{formatDateTime(r.createdAt)}</dd>
        </div>
      </dl>
      {r.paymentNote && <p className="mt-2 text-sm">Nota de pago: {r.paymentNote}</p>}
      {r.survey && (
        <p className="mt-2 text-sm">
          Encuesta: NPS {r.survey.nps} · {r.survey.newContact ? 'contacto nuevo' : 'sin contacto nuevo'} · {r.survey.wouldReturn ? 'volvería' : 'no volvería'}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {r.status === 'requested' && (
          <a
            className="btn btn-line btn-sm"
            target="_blank"
            rel="noopener noreferrer"
            href={waLink(r.phone, `Hola ${first}, soy del equipo de AiTrava. Recibimos tu reserva ${r.code}. Te confirmo el cupo y te paso los datos de pago del anfitrión:`)}
          >
            <Icon name="whatsapp" size={17} /> Confirmar por WhatsApp
          </a>
        )}
        {r.phoneChallenge && (r.status === 'attended' || r.status === 'paid') && (
          <span className="flex items-center gap-1 text-sm">
            Reto del sobre:
            {[true, false].map((v) => (
              <button
                key={String(v)}
                disabled={busy}
                onClick={() => patch({ challengeCompleted: v })}
                aria-pressed={r.challengeCompleted === v}
                className={`narrow min-h-8 rounded-full border px-2.5 ${r.challengeCompleted === v ? 'border-pine bg-pine text-paper' : 'border-line'}`}
              >
                {v ? 'Lo cumplió' : 'No'}
              </button>
            ))}
          </span>
        )}
        {(r.status === 'attended' || r.status === 'paid') && !r.survey && (
          <button onClick={() => makeLink('survey-link')} className="btn btn-line btn-sm">
            <Icon name="message" size={17} /> Enlace de encuesta
          </button>
        )}
        <button onClick={() => makeLink('access-link')} className="btn btn-sm text-ink-2 hover:bg-paper-2">
          Nuevo enlace de la reserva
        </button>
        {!r.knowsTeam && (
          <button onClick={() => patch({ knowsTeam: true })} disabled={busy} className="btn btn-sm text-ink-2 hover:bg-paper-2">
            Marcar como amigo/familia
          </button>
        )}
        {!r.isDemo && (
          <button onClick={() => patch({ isDemo: true })} disabled={busy} className="btn btn-sm text-ink-2 hover:bg-paper-2">
            Marcar como prueba
          </button>
        )}
      </div>
      {link && (
        <div className="mt-3 rounded-lg border border-line bg-paper p-3 text-sm">
          <p className="break-all">{link}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => navigator.clipboard?.writeText(link)} className="link">
              Copiar
            </button>
            <a className="link" target="_blank" rel="noopener noreferrer" href={waLink(r.phone, `Hola ${first}, aquí está tu enlace: ${link}`)}>
              Enviar por WhatsApp
            </a>
          </div>
        </div>
      )}
      {error && <p className="error-text">{error}</p>}
    </article>
  );
}
