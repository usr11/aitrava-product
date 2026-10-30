'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { AdminTitle, prettyPhone, SALIDA_STATUS } from '@/components/admin/kit';
import { ReservationCard } from '@/components/admin/ReservationCard';
import { SalidaForm } from '@/components/admin/SalidaForm';
import { Icon } from '@/components/Icon';
import { Alert, Badge, ErrorState, Field, LoadingState, SeatMeter, Sheet } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { AdminReservation, AdminSalida } from '@/lib/admin-types';
import { formatCOP, formatDateTime } from '@/lib/format';
import { useApi } from '@/lib/useSalidas';

const LIVE = ['requested', 'confirmed', 'payment_reported', 'paid', 'attended', 'no_show'];

export default function SalidaAdmin() {
  const { id } = useParams<{ id: string }>();
  const { data: s, error, loading, reload, setData } = useApi<AdminSalida>(`/admin/salidas/${id}`);
  const [edit, setEdit] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const closeEdit = useCallback(() => setEdit(false), []);

  if (loading && !s) return <LoadingState />;
  if (error || !s) return <ErrorState text={error ?? undefined} onRetry={reload} />;

  const rs = s.reservations ?? [];
  const visible = showAll ? rs : rs.filter((r) => LIVE.includes(r.status) && !r.holdExpired);
  const paidLike = rs.filter((r) => ['paid', 'attended'].includes(r.status));
  const commissionDue = paidLike.reduce((a, r) => a + r.price * s.commissionRate, 0);
  const replace = (r: AdminReservation) => setData({ ...s, reservations: rs.map((x) => (x.id === r.id ? { ...x, ...r } : x)) });
  const roster = rs
    .filter((r) => ['confirmed', 'payment_reported', 'paid', 'attended'].includes(r.status))
    .map((r) => `${r.name} · ${prettyPhone(r.phone)}`)
    .join('\n');

  return (
    <>
      <Link href="/admin/salidas" className="mb-4 inline-flex min-h-10 items-center gap-1.5 font-semibold text-ink-2">
        <Icon name="back" size={18} /> Salidas
      </Link>
      <AdminTitle
        title={s.title}
        text={
          <span className="flex flex-wrap items-center gap-2">
            {formatDateTime(s.startsAt)} · {s.place.name} · {formatCOP(s.price)}
            <Badge tone={s.status === 'open' ? 'ok' : 'info'}>{SALIDA_STATUS[s.status]}</Badge>
            {s.isSimulacro && <Badge tone="warn">Simulacro</Badge>}
            {s.isDemo && <Badge tone="warn">DEMO</Badge>}
          </span>
        }
        action={
          <>
            {s.status !== 'draft' && (
              <Link href={`/salidas/${s.slug}`} target="_blank" className="btn btn-line btn-sm">
                Ver pública
              </Link>
            )}
            <button onClick={() => setEdit(true)} className="btn btn-pine btn-sm">
              <Icon name="edit" size={17} /> Editar
            </button>
          </>
        }
      />
      <Visibility s={s} onPublished={reload} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <SeatMeter capacity={s.capacity} taken={s.seatsTaken} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="size-4 accent-[var(--color-pine)]" />
              Ver canceladas y vencidas
            </label>
          </div>
          {visible.length ? (
            <ul className="grid gap-3">
              {visible.map((r) => (
                <li key={r.id}>
                  <ReservationCard r={r} onChange={replace} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel p-6 text-ink-2">Todavía no hay reservas activas.</p>
          )}
        </section>
        <aside className="space-y-4">
          <CloseOut s={s} commissionDue={commissionDue} onSaved={reload} />
          {roster && (
            <div className="panel p-4">
              <h2 className="font-bold">Lista para el grupo de WhatsApp</h2>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-ink-2">{roster}</pre>
              <button onClick={() => navigator.clipboard?.writeText(roster)} className="link mt-2 text-sm">
                Copiar lista
              </button>
            </div>
          )}
        </aside>
      </div>
      <Sheet open={edit} onClose={closeEdit} title="Editar salida" wide>
        <SalidaForm
          salida={s}
          onSaved={() => {
            setEdit(false);
            reload();
          }}
        />
      </Sheet>
    </>
  );
}

/** Cierre de la salida: entrevista al anfitrión, horas del equipo y cobro de la comisión. */
function CloseOut({ s, commissionDue, onSaved }: { s: AdminSalida; commissionDue: number; onSaved: () => void }) {
  const [hostNew, setHostNew] = useState(s.hostNewClients?.toString() ?? '');
  const [hours, setHours] = useState(s.coordinatorHours?.toString() ?? '');
  const [paid, setPaid] = useState(s.commissionPaidAmount?.toString() ?? String(Math.round(commissionDue)));
  const [msg, setMsg] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);

  const save = async (body: Record<string, unknown>, path = `/admin/salidas/${s.id}`, method = 'PATCH') => {
    setMsg(null);
    try {
      await api(path, { method, json: body });
      setMsg({ tone: 'ok', text: 'Guardado.' });
      onSaved();
    } catch (e) {
      setMsg({ tone: 'bad', text: e instanceof ApiError ? e.message : 'No se pudo guardar.' });
    }
  };

  return (
    <div className="panel space-y-4 p-4">
      <h2 className="font-bold">Cierre de la salida</h2>
      <p className="text-sm text-ink-2">
        Comisión causada ({Math.round(s.commissionRate * 100)} % de las reservas pagadas): <strong className="tnum">{formatCOP(commissionDue)}</strong>
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Clientes nuevos (anfitrión)" htmlFor="hn">
          <input id="hn" className="input tnum" type="number" min={0} value={hostNew} onChange={(e) => setHostNew(e.target.value)} />
        </Field>
        <Field label="Horas del equipo" htmlFor="hh">
          <input id="hh" className="input tnum" type="number" min={0} step={0.5} value={hours} onChange={(e) => setHours(e.target.value)} />
        </Field>
      </div>
      <button
        onClick={() => save({ hostNewClients: hostNew === '' ? null : Number(hostNew), coordinatorHours: hours === '' ? null : Number(hours) })}
        className="btn btn-line btn-sm btn-block"
      >
        Guardar entrevista y horas
      </button>
      <div className="border-t border-line pt-4">
        <Field label="Comisión cobrada al anfitrión" htmlFor="cp" hint={s.commissionPaidAt ? `Registrada el ${formatDateTime(s.commissionPaidAt)}` : 'Hasta 3 días después de la salida.'}>
          <input id="cp" className="input tnum" type="number" min={0} step={100} value={paid} onChange={(e) => setPaid(e.target.value)} />
        </Field>
        <button onClick={() => save({ amount: Number(paid) }, `/admin/salidas/${s.id}/commission`, 'POST')} className="btn btn-pine btn-sm btn-block mt-3">
          Registrar comisión cobrada
        </button>
      </div>
      {s.status !== 'done' && new Date(s.startsAt) < new Date() && (
        <button onClick={() => save({ status: 'done' })} className="btn btn-ember btn-sm btn-block">
          Marcar la salida como realizada
        </button>
      )}
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
    </div>
  );
}

/** Dice si la salida se ve en la página pública y, si no, por qué (con la acción para arreglarlo). */
function Visibility({ s, onPublished }: { s: AdminSalida; onPublished: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const past = new Date(s.startsAt) <= new Date();
  const publish = async () => {
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/salidas/${s.id}`, { method: 'PATCH', json: { status: 'open' } });
      onPublished();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo publicar.');
    } finally {
      setBusy(false);
    }
  };
  if (s.status === 'open' && !past)
    return (
      <div className="mb-5">
        <Alert tone="ok">Publicada: se ve en la página y recibe reservas.</Alert>
      </div>
    );
  const text =
    s.status === 'draft'
      ? past
        ? 'Está en borrador y su fecha ya pasó: no se ve en la página. Cambia la fecha en Editar y luego publícala.'
        : 'Está en borrador: nadie la ve fuera del panel.'
      : s.status === 'open'
        ? 'Su fecha ya pasó: ya no aparece en la página. Si se realizó, márcala como realizada.'
        : s.status === 'closed'
          ? past
            ? 'Cerrada y con fecha pasada: ya no aparece en la página.'
            : 'Cerrada: se ve en la página, pero no recibe reservas.'
          : s.status === 'done'
            ? 'Realizada: ya no aparece en la página.'
            : 'Cancelada: no aparece en la página.';
  return (
    <div className="mb-5">
      <Alert tone="warn">
        <span className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>{text}</span>
          {(s.status === 'draft' || s.status === 'closed') && !past && (
            <button onClick={publish} disabled={busy} className="btn btn-ember btn-sm shrink-0">
              {busy ? 'Publicando…' : s.status === 'draft' ? 'Publicar en la página' : 'Abrir reservas'}
            </button>
          )}
        </span>
        {error && <span className="error-text block">{error}</span>}
      </Alert>
    </div>
  );
}
