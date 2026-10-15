'use client';

import { useEffect, useState } from 'react';
import { BarList, DailyChart, Funnel, StepChart } from '@/components/admin/charts';
import { Icon } from '@/components/Icon';
import { Spinner } from '@/components/Spinner';
import { api, API_URL, tokenStore } from '@/lib/api';
import { VIBES } from '@/lib/constants';
import { formatCOP } from '@/lib/format';

type Item = { label: string; value: number };
type Payment = {
  id: string;
  nombre: string;
  email: string;
  fuente: string;
  tipo: 'reserva' | 'completo';
  pagado: number;
  total: number;
  porCobrar: number;
  esRegalo: boolean;
  abrioElSobre: boolean;
  fecha: string;
};

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
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const load = () => {
      api<Metrics>('/admin/metrics').then(setM).catch(() => {});
      api<Payment[]>('/admin/payments').then(setPayments).catch(() => {});
    };
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

      {/* Lo que pidió el equipo: cuánta gente entra, cuánta compra y cuánta termina todo el flujo */}
      <section className="rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
        <h2 className="display text-4xl">Pagos y reservas</h2>
        <p className="mt-1 text-sm text-muted">Quién apartó su cupo, quién pagó el viaje completo y cuántos llegaron hasta el final.</p>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Apartaron ($39.900)"
            value={k.reservas ?? 0}
            hint={`${formatCOP((k.reservas ?? 0) * 39_900)} recibidos · ${formatCOP(k.porCobrar ?? 0)} por cobrar`}
          />
          <Stat
            label="Pagaron completo"
            value={k.pagosCompletos ?? 0}
            hint={`${k.reservations ? Math.round(((k.pagosCompletos ?? 0) / k.reservations) * 100) : 0} % de las compras`}
          />
          <Stat label="Visitantes que compran" value={`${k.visitorToPurchase ?? 0} %`} hint="del total de personas que entraron" />
          <Stat label="Completaron todo el flujo" value={k.flujoCompleto ?? 0} hint={`${k.flujoCompletoPct ?? 0} % de los que compraron abrieron el sobre`} />
          <Stat label="Recaudado (simulado)" value={formatCOP(k.recaudado ?? 0)} hint={`sobre ${formatCOP(k.sales ?? 0)} en viajes vendidos`} />
          <Stat label="Clics al asesor de WhatsApp" value={k.whatsappClicks ?? 0} />
          <Stat label="Viajes de regalo" value={k.gifts ?? 0} />
          <Stat label="Re-sorteos" value={k.rerolls ?? 0} />
        </div>

        {payments.length > 0 && (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line text-muted-2">
                <tr>
                  {['Persona', 'Tipo', 'Pagó hoy', 'Total del viaje', 'Por cobrar', 'Abrió el sobre', 'Fuente', 'Fecha'].map((h) => (
                    <th key={h} className="eyebrow px-4 py-3 text-[10px] font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-semibold">{p.nombre}</span>
                      <span className="block text-xs text-muted">{p.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.tipo === 'completo' ? 'bg-ok/20 text-ok' : 'bg-primary/20 text-primary'}`}>
                        {p.tipo === 'completo' ? 'Pago completo' : 'Apartó'}
                      </span>
                      {p.esRegalo && <span className="ml-2 text-xs text-secondary">regalo</span>}
                    </td>
                    <td className="px-4 py-3 font-mono">{formatCOP(p.pagado)}</td>
                    <td className="px-4 py-3 font-mono text-muted">{formatCOP(p.total)}</td>
                    <td className="px-4 py-3 font-mono text-muted">{p.porCobrar ? formatCOP(p.porCobrar) : '—'}</td>
                    <td className="px-4 py-3">{p.abrioElSobre ? '✅' : '⏳'}</td>
                    <td className="px-4 py-3 text-muted">{p.fuente}</td>
                    <td className="px-4 py-3 font-mono text-xs text-dim">{new Date(p.fecha).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
      </div>
    </div>
  );
}
