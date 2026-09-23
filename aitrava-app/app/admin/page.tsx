'use client';

import { useEffect, useState } from 'react';
import { BarList, DailyChart, Funnel, StepChart } from '@/components/admin/charts';
import { Icon } from '@/components/Icon';
import { Spinner } from '@/components/Spinner';
import { api, API_URL, tokenStore } from '@/lib/api';
import { VIBES } from '@/lib/constants';
import { formatCOP } from '@/lib/format';

type Item = { label: string; value: number };
type Metrics = {
  kpis: Record<string, number | null>;
  funnel: Item[];
  daily: Record<string, number | string>[];
  quizSteps: Item[];
  topVibes: Item[];
  topAvoid: Item[];
  topDestinations: Item[];
  utm: Item[];
  budgets: Item[];
};

const vibeLabel = (id: string) => VIBES.find((v) => v.id === id)?.label ?? id;

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="eyebrow text-[10px] text-muted-2">{label}</p>
      <p className="display mt-2 text-4xl sm:text-5xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      <h2 className="mb-4 font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function AdminMetrics() {
  const [m, setM] = useState<Metrics | null>(null);

  useEffect(() => {
    const load = () => api<Metrics>('/admin/metrics').then(setM).catch(() => {});
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, []);

  if (!m) return <Spinner full />;
  const k = m.kpis;

  const exportCsv = async () => {
    const res = await fetch(`${API_URL}/api/admin/export.csv`, { headers: { Authorization: `Bearer ${tokenStore.get()}` } });
    const url = URL.createObjectURL(await res.blob());
    const a = Object.assign(document.createElement('a'), { href: url, download: 'aitrava-eventos.csv' });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Se actualiza cada 15 s · datos reales de la app</p>
        <button onClick={exportCsv} className="btn btn-dark min-h-10 py-2 text-sm">
          <Icon name="download" size={16} /> Exportar eventos (CSV)
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Usuarios registrados" value={k.users ?? 0} hint={`${k.visitorToSignup} % de los visitantes`} />
        <Stat label="Viajes generados" value={k.trips ?? 0} hint={`${k.aiShare} % con IA`} />
        <Stat label="Reservas" value={k.reservations ?? 0} hint={`${k.tripToReservation} % de los viajes`} />
        <Stat label="NPS" value={k.nps ?? '—'} hint={`${k.npsResponses} respuestas`} />
        <Stat
          label="Ingresos (simulados)"
          value={formatCOP((k.commission ?? 0) + (k.partnerCommission ?? 0))}
          hint={`${formatCOP(k.commission ?? 0)} de tarifa fija + ${formatCOP(k.partnerCommission ?? 0)} de aliados · sobre ${formatCOP(k.sales ?? 0)} vendidos`}
        />
        <Stat label="Apuestas de amigos" value={k.friendGuesses ?? 0} hint={`${k.shares} veces compartido`} />
        <Stat label="Registros por referido" value={k.referred ?? 0} />
        <Stat label="Acierto de apuestas" value={`${k.guessAccuracy} %`} hint={`${k.reveals} sobres abiertos`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Embudo de conversión (personas únicas)">
          <Funnel data={m.funnel} />
        </Panel>
        <Panel title="Actividad diaria (últimos 30 días)">
          <DailyChart data={m.daily} />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="¿Dónde abandonan el quiz?">
          <StepChart data={m.quizSteps} />
        </Panel>
        <Panel title="Lo que más buscan">
          <BarList data={m.topVibes.map((v) => ({ ...v, label: vibeLabel(v.label) }))} />
        </Panel>
        <Panel title="Lo que quieren evitar">
          <BarList data={m.topAvoid} color="#b9bec6" />
        </Panel>
        <Panel title="Destinos asignados">
          <BarList data={m.topDestinations} />
        </Panel>
        <Panel title="Presupuesto por persona">
          <BarList data={m.budgets} />
        </Panel>
        <Panel title="Origen de los usuarios (utm)">
          <BarList data={m.utm} />
        </Panel>
        <Panel title="Comportamiento de compra" className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="display text-4xl text-primary">{k.deposits}</p><p className="text-xs text-muted">reservas solo con abono</p></div>
            <div><p className="display text-4xl text-primary">{k.rerolls}</p><p className="text-xs text-muted">re-sorteos</p></div>
            <div><p className="display text-4xl text-primary">{k.gifts}</p><p className="text-xs text-muted">viajes de regalo</p></div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
