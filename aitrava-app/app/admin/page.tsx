'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AdminTitle, Metric, Table } from '@/components/admin/kit';
import { Badge, ErrorState, LoadingState } from '@/components/ui';
import type { Overview, ValueBlock } from '@/lib/admin-types';
import { formatCOP, formatPct } from '@/lib/format';
import { useApi } from '@/lib/useSalidas';

const RANGES = [
  { key: 'all', label: 'Todo' },
  { key: '30', label: '30 días' },
  { key: '7', label: '7 días' },
] as const;

const query = (k: string) => (k === 'all' ? '' : `?from=${new Date(Date.now() - Number(k) * 86_400_000).toISOString()}`);

function Section({ title, text, children }: { title: string; text?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="title text-[1.4rem]">{title}</h2>
      {text && <p className="mt-1 max-w-3xl text-ink-2">{text}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ValueGrid({ v }: { v: ValueBlock }) {
  const ind = (x: ValueBlock['nps'], pct = true) => ({
    value: x.value == null ? '—' : pct ? formatPct(x.value) : Math.round(x.value).toString(),
    ok: x.value == null ? null : x.value >= x.target,
    target: pct ? `≥ ${formatPct(x.target)}` : `≥ ${x.target}`,
    hint: `n = ${x.n}`,
  });
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Llegaron solos y salieron con ≥ 1 contacto" {...ind(v.newContactRate)} />
        <Metric label="Volverían con AiTrava" {...ind(v.wouldReturnRate)} />
        <Metric label="NPS de la salida" {...ind(v.nps, false)} />
        <Metric label="Reto del celular completado" {...ind(v.challengeRate)} />
        <Metric label="Clientes nuevos confirmados por el anfitrión" {...ind(v.hostConfirmsRate)} />
      </div>
      <p className="mt-3 text-sm text-ink-3">
        {v.salidasDone} salidas realizadas · {v.attended} asistentes · {v.surveys} encuestas.
      </p>
      {v.improvements.length > 0 && (
        <details className="panel mt-3 p-4">
          <summary className="cursor-pointer font-semibold">Qué cambiarían ({v.improvements.length})</summary>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-2">
            {v.improvements.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

export default function Tablero() {
  const [range, setRange] = useState<string>('all');
  const [mode, setMode] = useState<'real' | 'simulacro'>('real');
  const { data: o, error, loading, reload } = useApi<Overview>(`/admin/overview${query(range)}`);

  return (
    <>
      <AdminTitle
        title="Tablero de evidencia"
        text="Lo que pide la junta, contra las metas fijadas antes de salir. No cuenta lo DEMO, los simulacros ni las cuentas del equipo."
        action={
          <div className="flex rounded-full border border-line p-1" role="group" aria-label="Periodo">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                aria-pressed={range === r.key}
                className={`min-h-9 rounded-full px-3 text-sm font-semibold ${range === r.key ? 'bg-pine text-paper' : 'text-ink-2'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />
      {loading && !o && <LoadingState rows={4} />}
      {error && <ErrorState text={error} onRetry={reload} />}
      {o && (
        <>
          <Section title="Venta e intento de pago (C3)" text="Escalera de evidencia. Solo cuentan como venta los pagos verificados de compradores que cumplen V1–V5.">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Nivel 2 · interés (lista de espera)" value={String(o.evidence.interest)} />
              <Metric label="Nivel 3–4 · reservas (aceptan precio y condiciones)" value={String(o.evidence.reservations)} hint={`${o.evidence.qualified} cumplen V1–V5 · ${o.evidence.pendingReview} por revisar V5`} />
              <Metric label="Nivel 5 · pago reportado" value={String(o.evidence.paymentReported)} hint={`${o.evidence.paid} verificados`} />
              <Metric
                label="Pagos verificados de compradores V1–V5"
                value={String(o.evidence.paidQualified)}
                target={`≥ ${o.targets.paidBuyers}`}
                ok={o.evidence.paidQualified >= o.targets.paidBuyers ? true : o.evidence.reservations ? false : null}
              />
              <Metric
                label="Conversión reserva → pago"
                value={formatPct(o.evidence.conversionToPay)}
                target={`≥ ${formatPct(o.targets.conversionToPay)}`}
                ok={o.evidence.conversionToPay == null ? null : o.evidence.conversionToPay >= o.targets.conversionToPay}
              />
              <Metric
                label="CAC (pauta ÷ reservas pagadas)"
                value={o.cac.value == null ? '—' : formatCOP(o.cac.value)}
                target={`≤ ${formatCOP(o.targets.cacMax)}`}
                ok={o.cac.value == null ? null : o.cac.value <= o.targets.cacMax}
                hint={`Pauta ${formatCOP(o.cac.spend)} · ${o.cac.paid} pagadas`}
              />
              <Metric label="Amigos o familia del equipo (no cuentan)" value={String(o.evidence.friendsFamily)} />
              <Metric label="Reservas en simulacros (no cuentan)" value={String(o.evidence.simulacros)} />
            </div>
            <Link href="/admin/reservas" className="link mt-3 inline-block">
              Revisar V5 y estados en Reservas
            </Link>
          </Section>

          <Section title="Entrega de valor (C1)" text="Sale de la encuesta de cierre y de lo que el equipo marca en cada salida.">
            <div className="mb-3 flex rounded-full border border-line p-1 sm:inline-flex" role="group" aria-label="Tipo de salida">
              {(['real', 'simulacro'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={`min-h-9 flex-1 rounded-full px-4 text-sm font-semibold ${mode === m ? 'bg-pine text-paper' : 'text-ink-2'}`}
                >
                  {m === 'real' ? 'Salidas reales' : 'Simulacros'}
                </button>
              ))}
            </div>
            <ValueGrid v={o.value[mode]} />
          </Section>

          <Section title="Test de ganchos A/B (TC0)" text={o.ab.decision}>
            <Table min={620}>
              <thead>
                <tr>
                  <th>Variante</th>
                  <th>Visitas</th>
                  <th>Clics al gancho</th>
                  <th>Lista de espera</th>
                  <th>Reservas</th>
                  <th>Visita → lead</th>
                </tr>
              </thead>
              <tbody>
                {o.ab.variants.map((v) => (
                  <tr key={v.variant}>
                    <td>
                      <span className="font-bold">{v.variant}</span> <span className="text-ink-3">{v.label}</span> {o.ab.winner === v.variant && <Badge tone="ok">Gana</Badge>}
                    </td>
                    <td className="tnum">{v.visits}</td>
                    <td className="tnum">
                      {v.clicks} <span className="text-ink-3">({formatPct(v.clickRate)})</span>
                    </td>
                    <td className="tnum">{v.waitlist}</td>
                    <td className="tnum">{v.reservations}</td>
                    <td className="tnum font-semibold">{formatPct(v.leadRate, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <p className="mt-2 text-sm text-ink-3">
              Regla: ≥ {o.targets.tc0ClicksPerVariant} visitas por variante y ≥ {o.targets.tc0DiffPp} pp de diferencia.{' '}
              {o.ab.diffPp != null && `Diferencia actual: ${o.ab.diffPp.toFixed(1)} pp.`} Para forzar una variante: <code>?v=A</code> o <code>?v=B</code>.
            </p>
          </Section>

          <Section title="Embudo: atraer → persuadir → convertir → retener" text="Visitantes únicos por paso (eventos) y reservas reales (base de datos).">
            <ol className="space-y-2">
              {o.funnel.map((s) => {
                const max = o.funnel[0].value || Math.max(...o.funnel.map((x) => x.value), 1);
                const w = Math.max(2, Math.round((s.value / max) * 100));
                return (
                  <li key={s.key} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[14rem_1fr_7rem]">
                    <span className="truncate font-semibold">{s.label}</span>
                    <span className="h-6 rounded bg-paper-2">
                      <span className="block h-6 rounded bg-forest" style={{ width: `${Math.min(w, 100)}%` }} />
                    </span>
                    <span className="tnum text-right">
                      <strong>{s.value}</strong> <span className="text-ink-3">{s.fromPrevious == null ? '' : formatPct(s.fromPrevious)}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </Section>

          <Section title="Canales y CAC" text="Regla §5.6: si un canal pasa de $10.400 de CAC dos salidas seguidas, se le quita el presupuesto. La pauta se registra en Costos.">
            {o.channels.length ? (
              <Table min={620}>
                <thead>
                  <tr>
                    <th>Canal</th>
                    <th>Visitas</th>
                    <th>Reservas</th>
                    <th>Pagadas</th>
                    <th>Pauta</th>
                    <th>CAC</th>
                  </tr>
                </thead>
                <tbody>
                  {o.channels.map((c) => (
                    <tr key={c.channel}>
                      <td>
                        <span className="font-semibold">{c.channel}</span> <span className="text-ink-3">{c.label !== c.channel ? c.label : ''}</span>
                      </td>
                      <td className="tnum">{c.visits}</td>
                      <td className="tnum">{c.reservations}</td>
                      <td className="tnum">{c.paid}</td>
                      <td className="tnum">{formatCOP(c.spend)}</td>
                      <td className="tnum">
                        {c.cac == null ? '—' : formatCOP(c.cac)} {c.overCac && <Badge tone="bad">Sobre el tope</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-ink-3">Sin datos suficientes.</p>
            )}
          </Section>

          <Section title="Anfitriones (TC1-A)" text="Meta: ≥ 3 de 15 anfitriones aceptan por escrito una comisión ≥ 16 %. El anfitrión de prueba no suma.">
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Contactados" value={`${o.hosts.contacted} / ${o.targets.hostsContacted}`} ok={o.hosts.contacted >= o.targets.hostsContacted ? true : null} target={String(o.targets.hostsContacted)} />
              <Metric label="Aceptan ≥ 16 %" value={String(o.hosts.accepted)} target={`≥ ${o.targets.hostsAccepted}`} ok={o.hosts.contacted ? o.hosts.accepted >= o.targets.hostsAccepted : null} />
              <Metric label="Aceptan el 20 %" value={String(o.hosts.acceptedAt20)} hint="Con 16 % el año cierra en negativo (modelo)." />
            </div>
          </Section>

          <Section title="Decisión de viabilidad" text={o.viability.decision}>
            <div className="grid gap-3 sm:grid-cols-3">
              {o.viability.conditions.map((c) => (
                <Metric
                  key={c.key}
                  label={c.label}
                  value={c.value == null ? '—' : c.key === 'return' ? formatPct(c.value) : formatCOP(c.value)}
                  ok={c.ok}
                  target={c.key === 'contribution' ? '≥ $0' : c.key === 'cac' ? '≤ $10.400' : '≥ 25 %'}
                />
              ))}
            </div>
          </Section>
        </>
      )}
    </>
  );
}
