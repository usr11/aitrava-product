'use client';

import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { AdminHost, AdminPlace, AdminSalida } from '@/lib/admin-types';
import { LINES } from '@/lib/config';
import { isoToLocalInput, localInputToISO } from '@/lib/format';
import { useApi } from '@/lib/useSalidas';
import { Alert, Field } from '../ui';

const STATUSES = [
  { v: 'draft', l: 'Borrador (no se ve)' },
  { v: 'open', l: 'Abierta (recibe reservas)' },
  { v: 'closed', l: 'Cerrada (se ve, sin reservas)' },
  { v: 'done', l: 'Realizada' },
  { v: 'cancelled', l: 'Cancelada' },
] as const;

/** Crear o editar una salida. Los precios los define el equipo con el anfitrión (no se inventan). */
export function SalidaForm({ salida, onSaved }: { salida?: AdminSalida; onSaved: (s: AdminSalida) => void }) {
  const { data: places } = useApi<AdminPlace[]>('/admin/places');
  const { data: hosts } = useApi<AdminHost[]>('/admin/hosts');
  const [f, setF] = useState({
    placeId: salida?.placeId ?? '',
    hostId: salida?.hostId ?? '',
    title: salida?.title ?? '',
    summary: salida?.summary ?? '',
    startsAt: isoToLocalInput(salida?.startsAt),
    durationMin: String(salida?.durationMin ?? 180),
    meetingPoint: salida?.meetingPoint ?? '',
    capacity: String(salida?.capacity ?? 8),
    minToRun: String(salida?.minToRun ?? 5),
    price: String(salida?.price ?? ''),
    serviceFee: String(salida?.serviceFee ?? 0),
    commission: String(Math.round((salida?.commissionRate ?? 0.2) * 100)),
    includes: (salida?.includes ?? []).join('\n'),
    paymentInstructions: salida?.paymentInstructions ?? '',
    paymentUrl: salida?.paymentUrl ?? '',
    status: salida?.status ?? 'draft',
    womenOnly: salida?.womenOnly ?? false,
    isSimulacro: salida?.isSimulacro ?? false,
    isDemo: salida?.isDemo ?? false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const pickPlace = (id: string) => {
    const p = places?.find((x) => x.id === id);
    setF((prev) => ({ ...prev, placeId: id, title: prev.title || (p ? p.name : ''), price: prev.price || (p ? String(p.refPrice) : '') }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    // Al crear, el botón decide: "Publicar" la abre en la página; "Borrador" la deja oculta.
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status = salida ? f.status : submitter?.value === 'draft' ? 'draft' : 'open';
    if (status === 'open' && new Date(localInputToISO(f.startsAt)) <= new Date()) {
      return setError('La fecha ya pasó: una salida abierta solo se ve en la página si su fecha es futura.');
    }
    const commission = Number(f.commission) / 100;
    if (!f.placeId) return setError('Elige el lugar.');
    if (!f.startsAt) return setError('Pon la fecha y la hora.');
    if (commission < 0.16 && !confirm('La comisión está por debajo del piso del 16 %. ¿Guardar igual?')) return;
    setBusy(true);
    try {
      const body = {
        placeId: f.placeId,
        hostId: f.hostId || null,
        title: f.title,
        summary: f.summary,
        startsAt: localInputToISO(f.startsAt),
        durationMin: Number(f.durationMin),
        meetingPoint: f.meetingPoint,
        capacity: Number(f.capacity),
        minToRun: Number(f.minToRun),
        price: Number(f.price),
        serviceFee: Number(f.serviceFee || 0),
        commissionRate: commission,
        includes: f.includes.split('\n').map((s) => s.trim()).filter(Boolean),
        paymentInstructions: f.paymentInstructions || null,
        paymentUrl: f.paymentUrl.trim() || null,
        status,
        womenOnly: f.womenOnly,
        isSimulacro: f.isSimulacro,
        isDemo: f.isDemo,
      };
      const saved = await api<AdminSalida>(salida ? `/admin/salidas/${salida.id}` : '/admin/salidas', { method: salida ? 'PATCH' : 'POST', json: body });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Lugar" htmlFor="s-place">
          <select id="s-place" className="input" value={f.placeId} onChange={(e) => pickPlace(e.target.value)} required>
            <option value="">Elige un lugar</option>
            {(places ?? [])
              .filter((p) => p.status !== 'excluded')
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {LINES[p.line].short} · {p.name}
                  {p.status === 'verify' ? ' (por verificar)' : ''}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Anfitrión" htmlFor="s-host" optional>
          <select id="s-host" className="input" value={f.hostId} onChange={set('hostId')}>
            <option value="">Sin asignar</option>
            {(hosts ?? []).map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
                {h.isTestHost ? ' (de prueba)' : ''}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Título" htmlFor="s-title">
        <input id="s-title" className="input" value={f.title} onChange={set('title')} required minLength={4} maxLength={120} />
      </Field>
      <Field label="Descripción" htmlFor="s-sum" hint="Qué se hace, en 2 o 3 frases.">
        <textarea id="s-sum" className="input" rows={3} value={f.summary} onChange={set('summary')} required minLength={10} maxLength={1200} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Fecha y hora (Cali)" htmlFor="s-date">
          <input id="s-date" className="input" type="datetime-local" value={f.startsAt} onChange={set('startsAt')} required />
        </Field>
        <Field label="Duración (min)" htmlFor="s-dur">
          <input id="s-dur" className="input tnum" type="number" min={30} max={1440} value={f.durationMin} onChange={set('durationMin')} required />
        </Field>
        {salida && (
        <Field label="Estado" htmlFor="s-status">
          <select id="s-status" className="input" value={f.status} onChange={set('status')}>
            {STATUSES.map((s) => (
              <option key={s.v} value={s.v}>
                {s.l}
              </option>
            ))}
          </select>
        </Field>
        )}
      </div>
      <Field label="Punto de encuentro" htmlFor="s-meet">
        <input id="s-meet" className="input" value={f.meetingPoint} onChange={set('meetingPoint')} required minLength={4} maxLength={300} />
      </Field>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Field label="Cupos" htmlFor="s-cap">
          <input id="s-cap" className="input tnum" type="number" min={2} max={30} value={f.capacity} onChange={set('capacity')} required />
        </Field>
        <Field label="Mínimo" htmlFor="s-min">
          <input id="s-min" className="input tnum" type="number" min={1} max={30} value={f.minToRun} onChange={set('minToRun')} required />
        </Field>
        <Field label="Precio" htmlFor="s-price">
          <input id="s-price" className="input tnum" type="number" min={0} step={1000} value={f.price} onChange={set('price')} required />
        </Field>
        <Field label="Cargo serv." htmlFor="s-fee">
          <input id="s-fee" className="input tnum" type="number" min={0} step={1000} value={f.serviceFee} onChange={set('serviceFee')} />
        </Field>
        <Field label="Comisión %" htmlFor="s-com">
          <input id="s-com" className="input tnum" type="number" min={0} max={50} value={f.commission} onChange={set('commission')} required />
        </Field>
      </div>
      <Field label="Qué incluye" htmlFor="s-inc" hint="Una cosa por línea." optional>
        <textarea id="s-inc" className="input" rows={3} value={f.includes} onChange={set('includes')} />
      </Field>
      <Field label="Link de pago (Wompi)" htmlFor="s-url" hint="Si lo pones, el botón dice “Comprar mi cupo” y lleva a este pago. Vacío = se paga al anfitrión." optional>
        <input id="s-url" className="input" type="url" inputMode="url" placeholder="https://checkout.nequi.wompi.co/l/…" value={f.paymentUrl} onChange={set('paymentUrl')} maxLength={300} />
      </Field>
      <Field label="Datos de pago del anfitrión" htmlFor="s-pay" hint="El viajero los ve solo cuando el equipo confirma su cupo." optional>
        <textarea id="s-pay" className="input" rows={2} value={f.paymentInstructions} onChange={set('paymentInstructions')} maxLength={1000} />
      </Field>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="choice">
          <input type="checkbox" checked={f.womenOnly} onChange={set('womenOnly')} /> Solo mujeres
        </label>
        <label className="choice">
          <input type="checkbox" checked={f.isSimulacro} onChange={set('isSimulacro')} /> Simulacro (no cuenta como venta)
        </label>
        <label className="choice">
          <input type="checkbox" checked={f.isDemo} onChange={set('isDemo')} /> DEMO
        </label>
      </div>
      {error && <Alert tone="bad">{error}</Alert>}
      {salida ? (
        <button disabled={busy} className="btn btn-pine">
          {busy ? 'Guardando…' : 'Guardar cambios'}
        </button>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button disabled={busy} value="open" className="btn btn-ember">
            {busy ? 'Guardando…' : 'Publicar en la página'}
          </button>
          <button disabled={busy} value="draft" className="btn btn-line">
            Guardar como borrador
          </button>
        </div>
      )}
      {!salida && <p className="hint">Un borrador no lo ve nadie fuera del panel; lo publicas después desde la salida.</p>}
    </form>
  );
}
